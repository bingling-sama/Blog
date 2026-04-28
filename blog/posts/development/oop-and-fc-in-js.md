---
date: 2025-11-24 17:17:41
updated: 2026-04-29 00:37:22
title: JavaScript 中的 OOP 与 FC
description: 这篇分享主要让大家了解一下 js 中的 oop 与 fc，通过结合原理学习语法来提高大家的学习效率、加深大家对知识的理解。
tags:
  - FrontEnd
  - Study
category: Development
---

# JavaScript 中的 OOP 与 FC

这篇分享主要让大家了解一下 js 中的 oop 与 fc，通过结合原理学习语法来提高大家的学习效率、加深大家对知识的理解。

## 面向对象编程（OOP）

首先，什么是 OOP？

> **Object-oriented programming** (**OOP**) is a [programming paradigm](https://en.wikipedia.org/wiki/Programming_paradigm "Programming paradigm") based on the [object](https://en.wikipedia.org/wiki/Object_\(computer_science\) "Object (computer science)")[1](https://en.wikipedia.org/wiki/Object-oriented_programming#cite_note-alanKayOnOO-1) – a [software](https://en.wikipedia.org/wiki/Software "Software") entity that [encapsulates](https://en.wikipedia.org/wiki/Encapsulation_\(programming\) "Encapsulation (programming)") [data](https://en.wikipedia.org/wiki/Data "Data") and [function(s)](https://en.wikipedia.org/wiki/Function_\(computer_programming\) "Function (computer programming)"). An OOP [computer program](https://en.wikipedia.org/wiki/Computer_program "Computer program") consists of objects that interact with one another.[2](https://en.wikipedia.org/wiki/Object-oriented_programming#cite_note-2)[3](https://en.wikipedia.org/wiki/Object-oriented_programming#cite_note-3) A [programming language](https://en.wikipedia.org/wiki/Programming_language "Programming language") that provides OOP features is classified as an _OOP language_ but as the set of features that contribute to OOP is contended, classifying a language as OOP and the degree to which it supports or is OOP, are debatable. As paradigms are not mutually exclusive, a language can be [multi-paradigm](https://en.wikipedia.org/wiki/Multi-paradigm "Multi-paradigm"); can be categorized as more than only OOP.  
> 面向对象编程（OOP）是一种基于对象的编程范式——一个封装数据和函数的软件实体。一个面向对象的计算机程序由相互交互的对象组成。 [2](https://en.wikipedia.org/wiki/Object-oriented_programming#cite_note-2) [3](https://en.wikipedia.org/wiki/Object-oriented_programming#cite_note-3) 提供面向对象特性的编程语言被归类为面向对象语言，但由于构成面向对象特性的特征集合存在争议，将一种语言归类为面向对象语言以及它支持或是否面向对象的程度是存在争议的。由于范式不是相互排斥的，一种语言可以是多范式；可以被归类为不仅仅是面向对象。
> *以上内容摘自 [Wikipedia](https://en.wikipedia.org/wiki/Object-oriented_programming)*

面向对象把程序看成由 **对象 *Object*** 组成，每个对象就像现实中的事物，有：

- **属性 *Attributes***（数据）
- **方法 *Method***（行为、能做的事）

根据对象所具有的属性与方法的不同，可以将对象进行 **分类**，这样就引入了 OOP 中 **类 *Class*** 的概念。类描述了对象所具有的属性与方法，但不关心其值。

而根据分类方式的细致程度不同，可以将一个类里的对象进行更细致的分类，这就引入了 **子类 & 父类** 的概念。

非常经典且简单的例子：
我定义 *动物 Animal* 为一个类，那么就可以细分为 *猫 Cat* 和 *狗 Dog* 等等很多个子类。Animal 就是 Cat 和 Dog 的父类。而对象就是具体某只猫，比如这只：

![a-object](https://cdn.ipfsscan.io/weibo/large/007CWdRmgy1icjimglwjvj30ho05ojsd.jpg)

而 Animal 这一类对象都具有的 属性 和 方法 又对应什么呢？也很简单，首先属性例如：名字、年龄……方法例如：进食、呼吸……

Animal 的子类 Cat 和 Dog 一定具有他们父类的所有属性与方法，毕竟没有什么生物不需要进食和呼吸……

但特殊的地方在于：Cat 和 Dog 作为子类，可以具有父类没有的属性和方法，比如猫可以具有其特殊的方法：**哈气**，狗也可以有其特殊的方法：**口也💩**。

其他更加深入的内容就不再多讲了，感兴趣的同学可以私下去深入学习，或者来找我探讨。总之，OOP 的核心思想是 **用对象来模拟现实世界，通过对象之间的交互完成程序功能。**

## 函数式编程 （FC）

那么其次，什么是函数式编程？

> In [computer science](https://en.wikipedia.org/wiki/Computer_science "Computer science"), **functional programming** is a [programming paradigm](https://en.wikipedia.org/wiki/Programming_paradigm "Programming paradigm") where programs are constructed by [applying](https://en.wikipedia.org/wiki/Function_application "Function application") and [composing](https://en.wikipedia.org/wiki/Function_composition_\(computer_science\) "Function composition (computer science)") [functions](https://en.wikipedia.org/wiki/Function_\(computer_science\) "Function (computer science)"). It is a [declarative programming](https://en.wikipedia.org/wiki/Declarative_programming "Declarative programming") paradigm in which function definitions are [trees](https://en.wikipedia.org/wiki/Tree_\(data_structure\) "Tree (data structure)") of [expressions](https://en.wikipedia.org/wiki/Expression_\(computer_science\) "Expression (computer science)") that map [values](https://en.wikipedia.org/wiki/Value_\(computer_science\) "Value (computer science)") to other values, rather than a sequence of [imperative](https://en.wikipedia.org/wiki/Imperative_programming "Imperative programming") [statements](https://en.wikipedia.org/wiki/Statement_\(computer_science\) "Statement (computer science)") which update the [running state](https://en.wikipedia.org/wiki/State_\(computer_science\) "State (computer science)") of the program.  
> 在计算机科学中，函数式编程是一种编程范式，其中程序通过应用和组合函数来构建。它是一种声明式编程范式，其中函数定义是映射值到其他值的表达式树，而不是更新程序运行状态的命令式语句序列。
> *以上内容摘自 [Wikipedia](https://en.wikipedia.org/wiki/Functional_programming)*

函数式编程（Functional Programming，FP）是一种把 **“函数”作为核心** 的编程思想，强调用**表达式计算结果**，而不是通过修改状态来完成任务。

你可以把它理解为：  **用数学函数的方式写程序，让数据“流动”而不是被反复修改。**

它有几个关键特点：

1. **不可变性（Immutable）**：数据一旦创建就不修改，所有操作都会返回新的数据。更容易推理、减少 Bug。
2. **纯函数（Pure Function）**：同样的输入一定得到同样输出。且不依赖外部变量、不修改外部状态。可测试性强、行为可预测。
3. **函数是一等公民（First-Class Citizens）**：函数可以像变量一样传来传去，也能作为参数和返回值。
 4. **高阶函数（Higher-Order Functions）**：可以接收函数作为输入、或返回一个函数，例如 `map`, `filter`, `reduce`。

总之，函数式编程就是用**纯函数 + 不可变数据**来写程序，让逻辑更简洁，状态更可控。

面向对象与函数式编程这两种编程思想在 JavaScript 中被巧妙地融合，并在 js 的语法中体现，接下来我们就来看看 js 中的这两种思想。

## js中的相关特性

我们需要先对js这种语言中的各种特性有所了解，才能利用范式这种工具更好的对我们开发的软件进行组合。 这一部分主要会参考[ecma262](https://link.juejin.cn/?target=https%3A%2F%2Ftc39.es%2Fecma262%2F "https://tc39.es/ecma262/")。

### js语言的设计

Brendan Eich开发了js。他在[这篇文章](https://link.juejin.cn/?target=https%3A%2F%2Fbrendaneich.com%2F2008%2F04%2Fpopularity%2F "https://brendaneich.com/2008/04/popularity/")提到了js设计过程中的一些问题。  
Netscape需要在浏览器中内置一种脚本语言，根据领导要求，首先需要像java(Look like Java,因此很多语法和java类似),而作者本人偏向于scheme，因此最后在新的语言中选择了和Scheme一样的一等函数以及和Self一样的prototype作为主要组成。受java影响，有了原始类型和对象的区分，比如string和String。

以上设计加上后来的发展就成了现在的js。

### js特性概述

在js中的数据结构分为两种，原始类型和对象，js的对象创建并不是基于class的，而是有很多方式，比如字面量或者构造函数，每个构造函数都有一个`prototype`属性用于实现基于原型（prototype-based）的继承。一个构造函数的`prototype`还有一个`constructor`引用指向构造函数本身，当实现继承时，这个属性可能会改，按照惯例需要修正，但不是必须的（关于constructor参考[这里](https://link.juejin.cn/?target=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000016147953 "https://segmentfault.com/a/1190000016147953")）。

说起构造函数，这里补充一点相关概念，函数是一种特殊的对象，含有internal method `[[Call]]`,因此可以通过函数调用来执行相关代码，而构造函数又是一种特殊的函数，含有internal method `[[Construct]]`,可以通过`new`或`super`调用创建对象。

### js中的对象

#### 原型链

每一个通过构造函数创建的对象都有一个指向构造函数prototype属性的隐式引用(可以用`__proto__`访问但不推荐)，而这个prototype本身可能也有一个非null的引用指向它的prototype,等等，这就被称为原型链。当访问对象的一个属性时，会首先从该对象本身查找，如果找不到就会沿着原型链依次查找，直到找到或者找到尽头发现没有，原型链上的属性可以被覆盖。

相较基于class继承的语言，通常来说，状态被实例拥有，方法被class拥有，继承的只有结构和行为(behavior)，而js这一切都是可以继承的。这里的[行为是方法整体决定的，如果没有方法，一个class将只有结构](https://link.juejin.cn/?target=https%3A%2F%2Fwww.informit.com%2Farticles%2Farticle.aspx%3Fp%3D25856%26seqNum%3D6%23%3A~%3Atext%3DThe%2520behavior%2520of%2520an%2520object%2Cdefined%2520within%2520the%2520object%2520class.%26text%3DMethods%2520determine%2520what%2520type%2520of%2Cdata%252C%2520and%2520its%2520overall%2520behavior. "https://www.informit.com/articles/article.aspx?p=25856&seqNum=6#:~:text=The%20behavior%20of%20an%20object,defined%20within%20the%20object%20class.&text=Methods%20determine%20what%20type%20of,data%2C%20and%20its%20overall%20behavior.")。

原型链的尽头为null，要明确一个对象的原型链到底包括什么，这里可以大概分为以下

- 如果是个`new Object()`或字面量`{}`,其原型链为

```ini
var obj={}
//原型链 obj=>Object.prototype=>null
```

- 如果是new调用了其他构造函数，包括自定义的或者内置的（比如Array，内置构造函数不一定需要new调用，比如也可以通过字面量或者不使用new，比如`[]`或`Date()`）,这里以Array为例

```css
var arr =[]
//arr=>Array.prototype=>Object.prototype=>null
//如果是自定义构造函数也一样
var P=function(){}
var p=new P()
//p=>P.prototype=>Object.prototype=>null
```

- 如果在上一种情况下,延长原型链,其实就是怎么样实现继承

```css
//1. 使用Object.create()
var q=Object.create(p)
// q=>p

//2. 直接修改构造函数的prototype
function Q(){}
Q.prototype=p
var q=new Q()
//q=>p
//3. 通过Object.setPrototypeOf(obj, prototype)设置__proto__属性,可以直接修改原型链，这个操作很浪费性能，少用
function P(){
    this.b=1
}
function Q(){
    this.a=2
}
var q=new Q()
Object.setPrototypeOf(q,P.prototype)
// q=>P.prototype
//4. 使用call和apply借用构造函数时，和原型无关
var P=function(v){
    this.a=v
}
function Q(v){
    P.call(this,v)
}
var q=new Q(2)
// q=>Q.prototype=>Object.prototype=>null
```

我们可以通过`object instanceof constructor` 判断一个构造函数的prototype是否在指定对象的原型链中

```javascript
function Q(){
    this.a=2
}
var q=new Q()
console.log(q instanceof Q)
console.log(q instanceof Object)
```

可以通过`Object.getPrototypeOf(object)`获得对象的`__proto__`属性

#### Object

Object.prototype上有一些属性和方法被其他所有对象继承，在特定对象继承过程中可能会对某些字段重写。  
另外Object上还有很多静态方法用于处理关于对象的各种操作，具体请参考[mdn](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FJavaScript%2FReference%2FGlobal_Objects%2FObject "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object")

### js中的函数

在js中所有函数都是Function的实例，包括Object和Function本身,乃至各种内置构造函数（比如Array）,因此有

```javascript
Function.__proto__===Function.prototype//true
Function.prototype.__proto__===Object.prototype//true,即Function instanceof Object
//原型链 Function=>Function.prototype=>Object.prototype,以下类似

Object.__proto__===Function.prototype//true，即Object instanceof Function
Array.__proto__===Function.prototype //true

function a(){}
a.__proto__===Function.prototype//true

```

可见，所有函数的原型链到达`Object.prototype`之前需要先经过`Function.prototype`,一个函数是一个对象，更是一个函数。

#### Function

Funciton.prototype上有一些方法值得我们关注

- func.apply(thisArg, [argsArray])
- function.call(thisArg, arg1, arg2, ...)
- function.bind(thisArg[, arg1[, arg2[, ...]]])

其中前两个在一个对象的上下文应用另一个对象的方法，第三个用于修改上下文，其余参数会在返回的函数调用时使用

## js的函数式编程

在具体的了解函数式编程之前，这里先了解一些概念，参考Composing Software。

### 概念

#### Pure Function

一个纯函数是一个函数，符合以下特点

- 相同的输入总是返回相同输出
- 没有副作用

纯函数在函数式编程中很重要，但是实际的开发中，函数或多或少会有一些副作用，比如数据获取和操作dom。

#### Function Composition

函数复合是将两个或多个函数按照顺序生成一个函数或者执行操作。

#### Shared State

共享数据可以是变量、对象或内存空间。使用共享数据的一个问题是为了了解一个函数的副作用，需要知道每个共享数据的操作历史，比如对一个用户信息在不同终端的修改会发生冲突，因此在flux中要使用单向流。  
另一个问题是对共享数据的操作顺序也会造成不同结果，比如四则运算。

#### Immutability

一个不可变对象是创建后就不能改变，但是js在语言层面只提供了原始类型的不可变性，对对象并不提供这种特性，即使使用`Object.freeze()`等方法也只能冻结某个层级的对象修改，要想使用不可变数据，可以使用第三方库，比如[Immer](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fimmerjs%2Fimmer "https://github.com/immerjs/immer")。  
不可变对象是函数式编程的核心概念，没有不可变性，程序中的数据流就会不可控，应该使用原数据生成新数据，而不应该修改原来的数据。

在实际的操作中，对于一个特定的数据，不可变性和不同享，至少要满足一个。

#### Side Effects

副作用指的是除了对输出结果操作以外其他的操作，比如打印日志或修改dom，副作用在函数式编程中应该避免，即将副作用和数据流处理分开。

#### Reusability Through Higher Order Functions

高阶函数是任何以函数作为参数或返回函数的函数，经常用于

- 使用回调函数、promise或monads对动作、副作用或异步数据流进行抽象或隔离。
- 为操作各种类型的变量创建工具函数
- 为了复用或函数组合而创建偏函数或柯里化
- 将一系列输入的函数串联返回一个函数组合

#### Containers, Functors, Lists, and Streams

这里包括上面提到的monads，可以参考[Functors, Applicatives, And Monads In Pictures](https://link.juejin.cn/?target=https%3A%2F%2Fadit.io%2Fposts%2F2013-04-17-functors%2C_applicatives%2C_and_monads_in_pictures.html "https://adit.io/posts/2013-04-17-functors,_applicatives,_and_monads_in_pictures.html")

一个functor数据结构可以用于映射数据，比如 `[1,2,3].map(x => x *2)`,换句话说，它是一个容器，会为内部的数据应用一个函数，当看到这个词时应该想到`mappable`  
在这里被映射的是一个数组，只要提供map api，其他数据结构应该也可以，一个按顺序处理的list可以看作是一个stream。

#### Declarative vs Imperative

函数式编程是一种声明式范式，声明式编程会将流控制过程抽象，而不是用一行行代码描述怎么做，对应的是命令式。 比如函数doubleMap命令式的写法

```ini
const doubleMap = numbers => {
const doubled = [];
for (let i = 0; i < numbers.length; i++) {
	doubled.push(numbers[i] * 2);
   }
 return doubled;
 };
 console.log(doubleMap([2, 3, 4])); // [4, 6, 8]
```

声明式的写法

```ini
const doubleMap = numbers => numbers.map(n => n * 2);

 console.log(doubleMap([2, 3, 4])); // [4, 6, 8]

```

### 总结

一个函数式编程应该有以下特征

- 纯函数，而不是共享数据和副作用
- 不可变，而不是可变数据
- 函数组合，而不是命令式流控制
- 泛型工具而不是对某些数据的特定方法
- 声明式，而不是命令式
- 表达式，而不是语句

在js中的函数式应用可以参考[A GENTLE INTRODUCTION TO FUNCTIONAL JAVASCRIPT](https://link.juejin.cn/?target=https%3A%2F%2Fjrsinclair.com%2Farticles%2F2016%2Fgentle-introduction-to-functional-javascript-intro%2F "https://jrsinclair.com/articles/2016/gentle-introduction-to-functional-javascript-intro/")系列，最终目的就是将应用中的整个逻辑切分到不同的函数中，然后将函数组合，完成最终的任务。  
在具体处理过程中注意函数式编程的各种特征。

常见的函数组合方式包括

- compose,又称为pipe

```javascript
　const compose = (...functions) => flowIn => functions.reduceRight( ( acc,f ) => f(acc), flowIn )
```

- curry,这里实现一个具体的柯里化

```css
const add = a => b => a + b;
add(1)(2)
```

## js的面向对象编程

js的以原型为基础的继承不太适合实现面向对象的封装、继承和多态，而es6在语言层面实现了class语法，可以很方便的采用其他语言实践总结而来的设计模式和设计原则，这里建议采用ts,具体可参考[ts实现的23种设计模式和设计原则](https://juejin.cn/post/6897620357885198344 "https://juejin.cn/post/6897620357885198344")

无论采用何种范式，最终都是要将各个模块组合成我们的软件。

# 参考链接

本篇博客中部分内容摘自以下博文：

- [说起编程范式我们应知道什么](https://juejin.cn/post/6926930448283074568)
- [js中的面向对象编程和函数式编程](https_juejin.cn/?url=https%3A%2F%2Fjuejin.cn%2Fpost%2F6932852475527430157%23heading-6)
