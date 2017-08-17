import { Kind } from '../../utils';

export const activate = (registry, monaco) => {
    const languages = monaco.languages;    
    languages.registerCompletionItemProvider('json', {
        triggerCharacters: ['"'],
        provideCompletionItems: (model, position, token) => {
            const uri = model.uri;
            return new Promise((resolve, reject) => {
                if (token) {
                    token.onCancellationRequested(() => {
                        reject();
                    });
                }
                resolve({
                    isIncomplete: false,
                    items: completionItems.map((item, index) => {
                        return {
                            ...item,
                            position,
                            uri,
                            sortText: index.toString(),
                        }
                    })
                });
            });
        },
    });
}

// static competion items
const completionItems = [
    {
        kind: Kind.keyword,
        label: 'pages',
        detail: '页面'
    },
    {
        kind: Kind.keyword,
        label: 'window',
        detail: '默认窗口设置'
    },
    {
        kind: Kind.keyword,
        label: 'defaultTitle',
        detail: '默认页面标题'
    },
    {
        kind: Kind.keyword,
        label: 'backgroundColor',
        detail: '背景颜色'
    },
    {
        kind: Kind.keyword,
        label: 'pullRefresh',
        detail: '(boolean) 是否启用下拉刷新'
    },
    {
        kind: Kind.keyword,
        label: 'allowsBounceVertical'
    },
    {
        kind: Kind.keyword,
        label: 'textColor',
        detail: '文字颜色'
    },
    {
        kind: Kind.keyword,
        label: 'tabBar'
    },
    {
        kind: Kind.keyword,
        label: 'selectedColor',
        detail: 'tabbar 选中时颜色'
    },
    {
        kind: Kind.keyword,
        label: 'items',
        detail: 'tabars items'
    },
    {
        kind: Kind.keyword,
        label: 'pagePath',
        detail: 'tabbar item 点击切换的页面地址'
    },
    {
        kind: Kind.keyword,
        label: 'icon',
        detail: 'tabbar item 未选中时显示icon'
    },
    {
        kind: Kind.keyword,
        label: 'activeIcon',
        detail: 'tabbar item 选中时显示icon'
    },
    {
        kind: Kind.keyword,
        label: 'name',
        detail: 'tabbar item 显示文字'
    },
    {
        kind: Kind.keyword,
        label: 'debug',
        detail: '(boolean) 是否启用 debug 模式'
    },
]

