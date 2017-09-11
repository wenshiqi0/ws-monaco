import {
  createConnection, IConnection,
  TextDocuments, Diagnostic,
  InitializeParams, InitializeResult, DiagnosticSeverity,
  Range
} from 'vscode-languageserver'
import * as parser from '../../parser/schema'

// Create a connection for the server. The connection uses
// stdin / stdout for message passing
let connection: IConnection = createConnection(process.stdin, process.stdout)

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments()
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites.
// let workspaceRoot: string
connection.onInitialize((params): InitializeResult => {
  // workspaceRoot = params.rootPath
  return {
    capabilities: {
      // Tell the client that the server works in FULL text document sync mode
      textDocumentSync: documents.syncKind
    }
  }
})

const keyTypes = /^(Object|Image|Box|Array|String|Text|RichText|URL|Number|Boolean|Color|Enum|File|Date)$/

const commonMetas = {
  default: '指定默认值',
  description: '指定字段描述',
  if: '根据条件显示',
}

const metaRules = {
  String: {
    ...commonMetas,
    minLength: '指定最小字符数',
    maxLength: '指定最大字符数',
    regExp: '指定正则，比如 "/^https:/gi"',
    errorMsg: '指定正则校验出错后的提示信息',
  },

  Image: {
    ...commonMetas,
    width: '指定图片的宽度',
    height: '指定图片的高度',
    maxWidth: '指定图片的最大宽度',
    maxHeight: '指定图片的最小高度',
    maxSize: '指定图片最大大小，单位只能为 KB Image[maxSize: 60]',
  },

  URL: {
    ...commonMetas,
    regExp: '指定正则，比如 "/^https:/gi"',
  },
}

// 遍历 ast
const walkAst = (ast, callback: Function) => {
  callback(ast)
  const props = ast.props
  if (props && props.length) {
    props.forEach(prop => {
      walkAst(prop, callback)
    })
  }
}

type NodeType = 'Object' | 'Image' | 'Box' | 'Array' | 'String' | 'Text' | 'RichText' | 'URL' | 'Number' | 'Boolean' | 'Color' | 'Enum' | 'File' | 'Date'

const getNodeType = (node): NodeType => {
  if (node.type) {
    return node.type.replace(/^\w/, c => c.toUpperCase())
  }

  if (node.path) {
    return node.path[0]
  }

  return 'String'
}

const loc2range = (loc: { line: number, col: number, colEnd: number, lineEnd?: number }) => ({
  start: {
    line: loc.line - 1,
    character: loc.col,
  },
  end: {
    line: (loc.lineEnd || loc.line) - 1,
    character: loc.colEnd,
  },
})

documents.onDidChangeContent((change) => {
  const diagnostics: Diagnostic[] = []

  try {
    const ast = parser.parse(change.document.getText())
    walkAst(ast, (node) => {
      // 检查未知类型
      if (!node.type && node.path && node.path[0] && !keyTypes.test(node.path[0]) && node.pathLoc) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: loc2range(node.pathLoc),
          message: '未知的类型，可以使用的类型有: ' + keyTypes.source.replace(/[\^\$\(\)]/g, '').replace(/\|/g, ' | '),
        })
      }

      // 检查多余的 String
      if (!node.type && node.path && node.path[0] === 'String' && !node.meta) {
        diagnostics.push({
          severity: DiagnosticSeverity.Warning,
          range: loc2range(node.pathLoc),
          message: 'String 可以省略',
        })
      }

      // 检查 meta
      if (node.meta) {
        const nodeType = getNodeType(node)
        const metaRule = metaRules[nodeType] || metaRules.String

        node.meta.forEach(item => {
          if (!(item.key in metaRule)) {
            diagnostics.push({
              severity: DiagnosticSeverity.Warning,
              range: loc2range(item.keyLoc),
              message: `未知的 meta。\n${nodeType} 类型可用的字段有 ` + Object.keys(metaRule).join(' | '),
            })
          }
        })
      }

    })
  } catch (e) {
    // 语法错误
    const loc = e.hash.loc
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: {
        start: {
          line: loc.first_line - 1,
          character: loc.first_column,
        },
        end: {
          line: loc.last_line - 1,
          character: loc.last_column,
        }
      },
      message: '语法错误' // e.message
    })
  }

  // Send the computed diagnostics to VS Code.
  connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
})

// Listen on the connection
connection.listen()