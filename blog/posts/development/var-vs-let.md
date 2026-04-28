---
date: 2024-10-27 20:48:18
updated: 2026-04-29 00:37:11
category: Development
tags:
  - FrontEnd
  - Study
title: JavaScript 中 var 与 let 的区别
description: 一直不太清楚 JavaScript 中 var 与 let 的区别，于是今天好好了解了一下……
---
# JavaScript 中 `var` 与 `let` 的区别

一直不太清楚 JavaScript 中 var 与 let 的区别，于是今天好好了解了一下，主要有以下三大区别。

## 作用域

首先是作用域上的区别，`var` 的作用域是函数级别（function level）的，而 `let` 的作用域是块级别（block level）的。

如下面的例子：

```javascript
function foo() { // function level start
	if (true) { // block level start
		var c = 1
		let d = 1
	} // block level end
	// this works well
	console.log(c)
	// ReferenceError: d is not defined
	console.log(d)
} // function level end
```

可以看到，由 `let` 定义的变量只有在同一块级作用域内才能访问到，而由 `var` 定义的变量则在同一函数级作用域中可以访问到。

## 重声明

`var` 声明的变量是可以被重新声明的，而且作用域与被重声明前相同。需要注意的是，在开发过程中要谨慎使用这一特性，它可能导致一些无法预测的错误。而 `let` 声明的变量是不允许重声明的，尝试重声明一个 `let` 变量会引发语法错误，提示你不应该重声明一个 `let` 变量。

```javascript
// declaration
var a = 1
let b = 1

// redeclaration
var a = 2 // acceptable
let b = 2 // error
```

## 变量提升

使用 `var` 声明的变量会被提升到其直属函数级作用域中，这意味着你可以在声明并初始化一个变量前引用它，但其值为 `undefined`。而 `let` 变量则不会被提升到函数级作用域中，你只能在声明它以后进行引用。

```javascript
// Using var
console.log(a)
// Output: undefined (due to hoisting)
var a = 5; console.log(a)
// Output: 5

// Using let
console.log(b)
// Output: ReferenceError: Cannot access 'b' before initialization
let b = 10
console.log(b)
// Output: 10
```

这里顺便引入 Temporal Dead Zone 的概念。TDZ 指的是一个从块级作用域的头端开始，到一个变量被初始化结束的区域。在 JavaScript 中，由 `let` 和 `const` 声明的变量是有 TDZ 的，而由 `var` 声明的变量由于经过了提升，则不具有 TDZ。

```javascript
function foo() {
	console.log(myVar)
	// ReferenceError: Cannot access 'myVar' before initialization
	let myVar = "Hello, World!" // same as const
	console.log(myVar) // Outputs: Hello, World!
}

function bar() {
	console.log(myVar) // Outputs: undefined
	var myVar = "Hello, World!"
	console.log(myVar) // Outputs: Hello, World! 
}
```
