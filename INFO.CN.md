# Ant Editor

## Info

monaco 是 vscode 的核心编辑器，是由 vscode 的源代码分离打包出来的一个纯前端编辑器，支持多语言扩展，能够使用一些辅助编辑的功能，比如代码提示、代码详细信息展示、语法校验等基础功能。ant monaco 目前是基于这个分离的打包代码来进行扩展的，从早期的版本岛现在大概经历了三个阶段，记下来我将从 vscode 和 monaco 自身的设计以及 IDE 的需求来描述这几个阶段的历史意义。

## vscode

首先来简单阐述一下目前我认知的 vscode 的设计。

![vscode](https://gw.alipayobjects.com/zos/rmsportal/VpgAvXNHoGlAWNtVlnlg.png)

刚开始开发 IDE 的时候，在参考 vscode 的时候一直在思考它究竟是著名处理 Renderer 和 Main 线程的通信的，尤其是在涉及到插件的时候，在 vscode 的代码里面一直咩有发现类似的痕迹，atom 相对就很清晰，然后现在发现其实 vscode 在 Main 线程干的事情非常少，基本核心的功能包括插件机制实际都是跑在 Renderer 线程的，Renderer 线程本身也是有 Node 环境的，所以 vscode 选择了这样一种和 atom 不一样的方案。


从上面的图可以看出来，vscode 的核心功能都是在 Renderer 里面暴露出去的，这里应该是使用了类似于我在上周周报里面描述的那种方式，把 vscode module 都注入给了各个插件。（不过这里也不能完全确定，因为 vscode 是 amd 打包的，所以也可以在打包的时候在 define 上面注入进去，这种可能性会更高一点）这里有一点需要注意的是，实际 fork 进程的代码是在 Renderer 里面的，不过由于 Renderer 自身应该就是一个 Main 进程的 fork 进程，所以进程的 debug 信息会在 Main 进程的控制台中打印出来。

Monaco 和 vscode 不同在它的定位环境是浏览器，所以它不能使用系统 api，因为没有 Node 环境，所以在 Monaco 的 typescript 中使用的是 webworker，vscode 很好的处理了插件 server 和 client 通信上的问题，将 tcp、rpc、webworker、process 的通信都用一种更上层的方式封装了一下。

## Ant Monaco

接下来就是来吐槽一下 IDE 中编辑器的编年史。

### version 1 （Tea）

最早的一个版本是跑在 Tea 里面，这个时候说实话还没有恨理清楚 vscode 的代码，为了在进度上面能够赶上迭代速度（不过实际上貌似也没有赶上 = =！），所以在这个时候基本就是 Monaco + statci completionItems 的模式，这个时候的 languages features 是由 Monaco 内置的几个打包进去的插件提供的，其实也就没有发挥在桌面端的优势。

## version 2 （Tea ===> PuerTea）

这个版本也是现在实际跑在线上的版本。首先我修改了 Monaco （也就是 vscode <(￣︶￣)> ）的源代码，加了一个直接使用二进制 token 的 api，不过这个修改 vscode 很长时间都没有合并进去，后来我就 close 掉了。这样的好处就是 vscode-textmate 是可以直接解析出这种 token 的，使用起来会更快更方便，在桌面端上 vscode-textmate 是目前我认为编辑器最大的提升。除了这个，还覆盖了 token 的 mtk 色值。

```
meta.structure.dictionary.json

这是一个 json 语言的 token，实际上编辑器对于它在颜色上的判断只限于 meta，也就是你指定给 meta 是什么颜色，这个 token 对应的 text 在编辑器中就是什么颜色，而这个 token 类型是有限的，每一个 mtk 的色值就对应着这样的一个token type。
```

因为 Moanco 可能出于兼容全部 token 的原因而附加了一些可能一些语言本身使用不到的 token，所以它的 token 色值比 vscode-textmate 解析出来的多了一点，这就是覆盖这一块 css 样式的原因。

除了 languge token 之外，接下来处理的就是 language features，language features 覆盖的有很多个方面，最主要的是 completions、lint、hover 等。在这一版中，我使用的方法是通过 monaco api 来做到和 vscode 中类似的效果。monaco 本身是 vscode 的一部分，vscode 实现这些 features 是用的 api 和它是基本类似的，只有有些涉及系统 api 的被剔除了，因而这一块的完成速度是很快的，麻烦在于维护，因为这相当于世每一个插件都要由我来维护。js、json、css、axml 包括 fengdie 中的 schema 和 nunjucks，有些支持可能不是非常麻烦，但是对于 js 、axml、css 这种还是要去实现很多 monaco 的 api 来支持编辑功能，太繁琐，而且这样做的耦合度海比较高，这些语言的实现都是和编辑器粘连的，维护和写测试的角度来说都不可靠（虽然目前我们也没有写测试 ╮(￣▽￣)╭ ），而且对于更复杂功能开发来说简直是一种折磨，所以我决定还是开始改第三版。

## version 3 （dev）

这一版本的核心就是兼容 vscode 的插件，通过 monaco 的 api 和引入一些 vscode 的基础类型来完全模拟 vscode 的插件运行环境，对于目前我们还没有的一些功能，像 status item 这种就直接传空对象或者一个 noob 函数，对于我们已经支持的功能，通过对 require 的注入将 vscode 的 plugin 在 runtime 阶段引导到 Ant Monaco 内部实现来。这种做法虽然代码量是比较大的，因为要实现很多 vscode.d.ts 中的核心 api，而且需要对 vscode 更多的属性，因为需要使用它的内部定义类型，很多时候还不能直接使用，需要自己造轮子写一个，这里面当然还是有一些 ts 和 js 的差异，但是排开这些体力活好处还是非常多的。首先插件不需要我来维护了，我需要维护的是这样一个兼容层，而插件的维护是由 vscode 的开发或者一些第三方开发来做，我只需要关注一下变更就好了，社区的力量总是无穷的 m( _　_ )m ，（包括也有一些插件是由我们内部员工开发的，可以帅锅给他们来帮忙）还有就是我们还可以使用更多的其他不错的插件来丰富 IDE 的体验，语言方面当然可以添加像 md 这些的，另外 vscode 上有一个转换 wxml 到 axml 的插件也可以直接在 IDE 里面用，用户不用两头跑，更重要的是对于那些不太想使用 IDE 而使用 vscode 的开发而言，很多插件都是两边共用的。上面都是从编辑角度来说的，从另一个方面来说，IDE 现在其实就拥有了一套自己的插件机制，从现在的角度来说的确还比较鸡肋，但是如果从更远的角度，我们想给开发者更多的智能开发能力，包括设计、后端、文档，甚至 AR、VR 的时候，这个时候它就有一定价值了，这里包括了内部开发和外部开发，而目前来看 IDE 的插件会有两种，这一块还需要我进一步在开发过程中梳理出来。
