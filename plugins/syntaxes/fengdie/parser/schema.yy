// gitlab:/fengdie/schema-util/blob/master/parse/schema.yy
// 在 schema-util 基础上添加行号

%start expressions

%%

expressions
  : schema EOF
    { return $1; }
  | exports EOF
    { return $1; }
  ;

/* 如果是 schema 模式，外层分为数组和对象 */
schema
  : array
    { $$ = $1; }
  | object
    { $$ = $1; }
  ;

exports
  : export
    { $$ = [$1] }
  | exports export
    { $$ = [].concat($1, $2) }
  ;

export
  : EXPORT VAR schema
    { $$ = { key: $2, schema: $3 }}
  ;

/* 数组，取描述和属性列表 */
array
  : ARRAY STRING START props END
    { $$ = { type: 'array', description: $2, props: $4 } }
  | ARRAY STRING meta START props END
    { $$ = { type: 'array', description: $2, props: $5, meta: $3 } }
  | PUBLIC ARRAY STRING START props END
    { $$ = { public: true, type: 'array', description: $3, props: $5 } }
  | PUBLIC ARRAY STRING meta START props END
    { $$ = { public: true, type: 'array', description: $3, props: $6, meta: $5 } }
  ;

/* 对象，取描述和属性列表 */
object
  : OBJECT STRING START props END
    { $$ = { type: 'object', description: $2, props: $4 } }
  | OBJECT STRING meta START props END
    { $$ = { type: 'object', description: $2, props: $5, meta: $3 } }
  | PUBLIC OBJECT STRING START props END
    { $$ = { public: true, type: 'object', description: $3, props: $5 } }
  | PUBLIC OBJECT STRING meta START props END
    { $$ = { public: true, type: 'object', description: $3, props: $6, meta: $4 } }
  /* 抽奖描述, 和object基本一致，就是多了一个属性 */
  | LOTTRY STRING START props END
    { $$ = { type: 'object', description: $2, props: $4, lottery: true } }
  | LOTTRY STRING meta START props END
    { $$ = { type: 'object', description: $2, props: $5, lottery: true, meta: $3 } }
  | PUBLIC LOTTRY STRING START props END
    { $$ = { public: true, type: 'object', description: $3, props: $5, lottery: true } }
  | PUBLIC LOTTRY STRING meta START props END
    { $$ = { public: true, type: 'object', description: $3, props: $6, lottery: true, meta: $4 } }
  ;

/* 属性列表 */
props
  : prop
    { $$ = [$1] }
  | props prop
    { $$ = [].concat($1, $2) }
  ;

/* 属性条目 */
prop
/* xxx(yyy) 的情况 */
: VAR STRING
  { $$ = { key: $1, description: $2}}
/* xxx(yyy):zzz 的情况 */
| VAR STRING COLON var
  { $$ = { key: $1, description: $2, path: $4, pathLoc: { line: @4.first_line, col: @4.first_column, colEnd: @4.last_column } }}
/* xxx(yyy):zzz[aaa] 的情况 */
| VAR STRING COLON var meta
  { $$ = { key: $1, description: $2, path: $4, meta: $5, pathLoc: { line: @4.first_line, col: @4.first_column, colEnd: @4.last_column }  }}
/* xxx(yyy):Object{} 的情况 */
| VAR STRING COLON OBJECT START props END
  { $$ = { key: $1, description: $2, props: $6, type: 'object' }}
/* xxx(yyy):Object meta {} 的情况 */
| VAR STRING COLON OBJECT meta START props END
  { $$ = { key: $1, description: $2, props: $7, type: 'object', meta: $5 }}
/* xxx(yyy):Array{} 的情况 */
| VAR STRING COLON ARRAY START props END
  { $$ = { key: $1, description: $2, props: $6, type: 'array' }}
/* xxx(yyy):Array meta {} 的情况 */
| VAR STRING COLON ARRAY meta START props END
  { $$ = { key: $1, description: $2, props: $7, type: 'array', meta: $5 }}
/* xxx(yyy): Enum {} */
| VAR STRING COLON ENUM START props END
  { $$ = { key: $1, description: $2, items: $6, type: 'enum' }}
/* xxx(yyy): Enum meta {} */
| VAR STRING COLON ENUM meta START props END
  { $$ = { key: $1, description: $2, items: $7, type: 'enum', meta: $5 }}
/* xxx(yyy): Enum meta [] */
| VAR STRING COLON ENUM meta
  { $$ = { key: $1, description: $2, items: [], type: 'enum', meta: $5 }}
;

meta
  : METASTART metaprops METAEND
    { $$ = $2 }
  ;

metaprops
  : metaprop
    { $$ = [$1] }
  | metaprops metaprop
    { $$ = [].concat($1, $2) }
  ;

metaprop
  : VAR COLON METAVALUE_STRING
  { $$ = { key: $1, value: $3, keyLoc: { line: @1.first_line, col: @1.first_column, colEnd: @1.last_column }, valLoc: { line: @3.first_line, col: @3.first_column, colEnd: @3.last_column } } }
  | VAR COLON METAVALUE_NUMBER
  { $$ = { key: $1, value: parseFloat($3), keyLoc: { line: @1.first_line, col: @1.first_column, colEnd: @1.last_column }, valLoc: { line: @3.first_line, col: @3.first_column, colEnd: @3.last_column } } }
  | VAR COLON METAVALUE_BOOL
  { $$ = { key: $1, value: $3 === 'true', keyLoc: { line: @1.first_line, col: @1.first_column, colEnd: @1.last_column }, valLoc: { line: @3.first_line, col: @3.first_column, colEnd: @3.last_column } } }
  ;

var
  : VAR
    { $$ = [$1] }
  | var DOT VAR
    { $$ = [].concat($1, $3) }
  ;
