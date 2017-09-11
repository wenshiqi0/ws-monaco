%%

"Lottery"           return 'LOTTRY'
"Array"             return 'ARRAY'
"Object"            return 'OBJECT'
"Enum"              return 'ENUM'
"public"            return 'PUBLIC'
"export"            return 'EXPORT'
":"                 return 'COLON'
"{"                 return 'START'
"}"                 return 'END'
"["                 if (!yy.options) { yy.options= {} }; yy.options.meta = true; return 'METASTART'
"]"                 yy.options.meta = false; return 'METAEND'
(true|false)        return 'METAVALUE_BOOL'
[\d][\d\.]*         yy.options = yy.options || {} ; return yy.options.meta ? 'METAVALUE_NUMBER' : 'VAR';
[\w][\$\w\-]*       return 'VAR'
"."/[\$\w]          return 'DOT'
'"'(\\\"|[^\"])*'"' yytext = yytext.substr(1, yyleng-2).replace(/\\"/g,'"'); return 'METAVALUE_STRING';
"("(\\\)|[^\)])*")" yytext = yytext.substr(1, yyleng-2); return 'STRING';
\s+                 /*ignore whitespace*/
"/"\*[\s\S]+?\*"/"  /*ignore comment*/
","                 /*ignore comma*/
<INITIAL><<EOF>>    return 'EOF';
