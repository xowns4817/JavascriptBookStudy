# 1 this
모든 함수 스코프 내에 자동으로 설정되는 특수한 식별자

## 1.1 this를 왜
identify(), speak() 두 함수는 객체별로 다로 함수를 작성할 필요 없이 다중 콘텍스트 객체인 me와 you 모두에서 재사용 가능
```javascript
function identify() {
  return this.name.toUpperCase();
}

function speak() {
  var greeting = "Hello, I'm " + identify.call(this);
  console.log(greeting);
}

var me = {
  name: "Kyle"
};

var you = {
  name: "Reader"
};

identify.call(me);
identify.call(you);

speak.call(me);
speak.call(you);
```
this를 안쓰고 identify()와 speac() 함수에 콘텍스트 객체를 명시 가능
```javascript
function identify(context) {
  return context.name.toUpperCase();
}
function speak(context) {
  var greeting = "Hello, I'm " + identify(context);
  console.log(greeting);
}

var me = {
  name: "Kyle"
};

var you = {
  name: "Reader"
};

identify(you);
speak(me);
```
암시적인 객체 레퍼런스를 함께 넘기는 this 체계가 API 설계상 더 깔끔하고 명확하며 재사용에 용이  
사용 패턴이 복잡해질수로 명시적인 인자로 콘텍스트를 넘기는 방법이 this 콘텍스트를 사용하는 것보다 코드가 더 복잡  

## 1.2 헷갈리는 것들
this를 둘러싼 오해들

### 1.2.1 자기 자신
함수 그 자체를 가리키는 것 -> 함수는 this로 자기 참조를 할 수 없음
```javascript
function foo(num) {
  console.log("foo: " + num);
  // foo가 몇 번 호출됐는지 추적
  this.count++;
}
foo.count = 0;
var i;
for(i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}
console.log(foo.count);
```
foo.count = 0 -> foo 함수 객체에 count 프로퍼티가 추가됨  
this.count에서 this는 함수 객체를 바라보는 것이 아니며, 프로퍼티 명은 같지만 근거지를 둔 객체 자체가 다름  

우회(회피)책 - 렉시컬 스코프에 의존
```javascript
function foo(num) {
  console.log("foo: " + num);
  data.count++;
}
var data = {
  count: 0
}
var i;
for(i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}
console.log(foo.count);
```
함수가 내부에서 자신을 참조할 때 this만으로는 부족, 렉시컬 식별자(변수)를 거쳐 함수 객체를 참조함

```javascript
function foo() {
  foo.count = 4;
}
setTimeout(function() {
  // 익명함수는 자기 자신을 가리킬 방법이 없음
}, 10);
```
foo 함수는 foo라는 함수명 자체가 내부에서 자신을 가리키는 레퍼런스로 쓰임  
setTimeout()의 콜백 함수는 식별자가 없으므로 함수 자신을 참조할 수 없음  

```javascript
function foo(num) {
  console.log("foo: " + num);
  foo.count++;
}
foo.count = 0;
var i;
for(i = 0; i < 10; i++) {
  if (i > 5) {
    foo(i);
  }
}
console.log(foo.count);
```
this 없이 함수 객체 레퍼런스로 foo 식별자 대신 사용해도 문제없이 작동하나, this에 대한 이해 없이 문제를 회피하여 foo 렉시컬 스코프에 의존하는 것  

foo 함수 객체를 직접 가리키도록 강제하는 방법
```javascript
function foo(num) {
  console.log("foo: " + num);
  this.count++;
  // this는 foo를 어떻게 호출하느냐에 따라 foo가 됨
}
foo.count = 0;
var i;
for(i = 0; i < 10; i++) {
  if (i > 5) {
    foo.call(foo, i);
    // this는 확실히 함수 객체 foo 자신을 가리킴
  }
}
console.log(foo.count);
```

### 1.2.2 자신의 스코프
this는 어떤 식으로도 함수의 렉시컬 스코프를 참조하지 않음  
내부적으로 스코프는 별개의 식별자가 달린 프로퍼티로 구성된 객체의 일종이나, 스코프 객체는 자바스크립트 구현체인 엔진의 내부 부품이기 때문에 일반 자바스크립트 코드로는 접근하지 못함  

암시적으로 this가 함수의 렉시컬 스코프를 가리키게 하기
```javascript
function foo() {
  var a = 2;
  this.bar();
}

function bar() {
  console.log(this.a)
}

foo(); // ReferenceError: a is not defined
```
foo()와 bar()의 렉시컬 스코프 사이의 어떠한 연결 통로를 만들 수 없음  
렉시컬 스코프 안에 있는 뭔가를 this 레퍼런스로 참조하는 것은 애초에 불가능

## 1.3 this는 무엇인가
this는 작성 시점이 아닌 런타임 시점에 바인딩 되며 함수 호출 당시 상황에 따라 콘텍스트가 결정됨  
함수 선언 위치와 상관없이 this 바인딩은 오직 어떻게 함수를 호출했느냐에 따라 결정됨  

어떤 함수를 호출하면 활성화 레코드(실행 콘텍스트)가 만들어짐 - 함수가 호출된 근원(call stack)과 호출 방법, 전달된 인자 등의 정보가 담겨있음. this 레퍼런스는 그중 하나로, 함수가 실행되는 동안 이용 가능


# 2 this가 이런 거로군

## 호출부
this 바인딩  
호출부(함수 호출 코드)확인 후 this가 가리키는 것이 무엇인지 확인해야 함  
호출 스택(현재 실행 지점에 오기까지 호출된 함수의 스택)에서, 호출부는 현재 실행 중인 함수 직전의 호출 코드 내부에 있음  
```javascript
function baz() {
  // 호출 스택: baz
  // 호출부: 전역 스코프 내부
  console.log("baz");
  bar();
}

function bar() {
  // 호출 스택: baz -> bar
  // 호출부: baz 내부
  console.log("bar");
  foo();
}

function foo() {
  // 호출 스택: baz -> bar -> foo
  // 호출부: bar 내부
  console.log("foo");
}
baz(); //baz의 호출부
```

## 2.2 단지 규칙일 뿐
함수가 실행되는 동안 this가 무엇을 참조할지를 호출부가 어떻게 결정하는지에 대한 규칙과 그 우선순위

### 2.2.1 기본 바인딩
단독 함수 실행(standalone function invocation)에 관한 규칙  
나머지 규칙에 해당하지 않을 경우 적용되는 this의 기본 규칙
```javascript
function foo() {
  console.log(this.a);
}
var a = 2;
foo();
```
foo() 함수 호출 시 this.a는 전역 객체 a - 기본 바인딩이 적용되어 this는 전역 객체를 참조  
foo()는 있는 그대로의 함수 레퍼런스를 호출함  

엄격 모드에서는 전역 객체가 기본 바인딩 대상에서 제외됨
```javascript
function foo() {
  "use strict";
  console.log(this.a);
}
var a = 2;
foo(); // TypeError ('this' is undefined);
```
this 바인딩 규칙은 호출부에 의해 좌우, 비엄격 모드에서 foo() 함수의 본문 실행 시 전역 객체만이 기본 바인딩의 유일한 대상. foo() 호출부의 엄격 모드 여부는 상관 없음
```javascript
function foo() {
  console.log(this.a);
}
var a = 2;
(function() {
  "use strict";
  foo();
})();
```

### 2.2.2 암시적 바인딩
호출부에 콘텍스트 객체가 있는지, 즉 객체의 소유(포함) 여부를 확인
```javascript
function foo() {
  console.log(this.a);
}
var obj =  {
  a: 2,
  foo: foo
}
obj.foo();
```
obj에서 foo를 참조  
obj 객체가 foo 함수를 소유하거나 포함한 것은 아님  
호출부는 obj 콘텍스트로 foo()를 참조하므로 obj 객체는 함수 호출 시점에 함수의 레퍼런스를 소유 또는 포함한다고 볼 수 있음  
함수 레퍼런스에 대한 콘텍스트 객체가 존재할 때 암시적 바인딩 규칙에 의해 이 콘텍스트 객체가 함수 호출 시 this에 바인딩됨  
-> foo() 호출 시 obj는 this  

객체 프로퍼티 참조가 체이닝된 형태 - 최상위(최하위) 수준의 정보만 호출부와 연관됨
```javascript
function foo() {
  console.log(this.a);
}
var obj2 = {
  a: 42,
  foo: foo
};

var obj1 = {
  a: 2,
  obj2: obj2
};
obj1.obj2.foo();
```

#### 암시적 소실
암시적으로 바인딩된 함수에서 바인딩이 소실되는 경우  

엄격 모드 여부에 따라 전역 객체나 undefined 중 한 가지로 기본 바인딩 됨
```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo
};
var bar = obj.foo;
var a = "전역";
bar();
```
bar는 obj의 foo를 참조하는 것처럼 보이지만 foo를 직접 가리키는 또 다른 레퍼런스  
호출부에서 평범하게 bar()를 호출하므로 기본 바인딩이 적용됨  
콜백 함수를 전달하는 경우
```javascript
function foo() {
  console.log(this.a);
}
function doFoo(fn) {
  fn();
}
var obj = {
  a: 2,
  foo: foo
};
var a = "전역";
doFoo(obj.foo);
```
인자로 전달하는 것은 일종의 암시적인 할당 -> 함수를 인자로 넘기면 암시적으로 레퍼런스가 할당되어 이전의 예제와 같은 결과  
콜백을 받은 함수가 직접 작성한 함수가 아닌 내장함수인 경우
```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2,
  foo: foo
};
var a = "전역";
setTimeout(obj.foo, 100);
```
setTimeout() 함수의 이론적인 의사 구현체
```javascript
function setTimeout(fn, delay) {
  // delay 밀리초 동안 기다림
  fn(); //호출부
}
```
콜백 과정에서 this 바인딩 행방이 묘연해지는 경우가 많음  

### 2.2.3 명시적 바인딩
암시적 바인딩 - 함수 레퍼런스를 객체에 넣기 위해 객체 자신을 변형, 함수 레퍼런스 프로퍼티를 이용하여 this를 간접적으로 바인딩  
함수 레퍼런스 프로퍼티를 객체에 더하지 않고 어떤 객체를 this 바인딩에 이용하는 것을 명시적으로 드러내기 위해 call()과 apply() 메서드 사용  
this에 바인딩할 객체를 첫째 인자로 받아 함수 호출 시 이 객체를 this로 세팅
```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2
};
foo.call(obj);
```
객체 대신 단순 원시값을 인자로 전달하면 원시값에 대응되는 객체(new String(), new Boolean(), new Number())로 래핑됨 -> 박싱  

#### 하드 바인딩
명시적 바인딩의 변경
```javascript
function foo() {
  console.log(this.a);
}
var obj = {
  a: 2
}
var bar = function() {
  foo.call(obj);
};
bar();
setTimeout(bar, 100);
bar.call(window); //하드 바인딩된 bar에서 재정의된 this는 의미 없음
```
bar()는 내부에서 foo.call(obj)로 foo를 호출하면서 obj를 this에 강제로 바인딩  
따라서 bar를 어떻게 호출하든 이 함수는 항상 obj를 바인딩하여 foo를 실행  

하드 바인딩은 인자를 넘기고 반환 값을 돌려받는 창구가 필요할 때 주로 쓰임
```javascript
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}
var obj = {
  a: 2
};
var bar = function() {
  return foo.apply(obj, arguments);
};
var b = bar(3);
console.log(b);
```
재사용 가능한 헬퍼 함수를 쓰는 것도 동일한 패턴
```javascript
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}

function bind(fn, obj) {
  return function() {
    return fn.apply(obj, arguments);
  };
}
var obj = {
  a: 2
};

var bar = bind(foo, obj);
var b = bar(3);
console.log(b);
```

ES5 내장 유틸리티에 구현된 Function.prototype.bind
```javascript
function foo(something) {
  console.log(this.a, something);
  return this.a + something;
}
var obj = {
  a: 2
};
var bar = foo.bind(obj);
var b = bar(3);
console.log(b);
```
bind()는 주어진 this 콘텍스트로 원본 함수를 호출하도록 하드 코딩된 새 함수를 반환함

#### API 호출 콘텍스트
많은 라이브러리 함수와 자바스크립트 언어 및 호스트 환경에 내장된 여러 새로운 함수는 대게 콘텍스트라 불리는 선택적인 인자를 제공  
bind()를 써서 콜백 함수의 this를 지정할 수 없는 경우를 대비한 예비책
```javascript
function foo(el) {
  console.log(el, this.id);
}
var obj = {
  id: "good"
}
// foo() 호출 시 obj를 this로 사용
[1, 2, 3].forEach(foo, obj);
```

### 2.2.4 new 바인딩
전통적인 클래스 지행 언어의 생성자 - 클래스에 붙은 특별한 메서드  
something = new MyClass();  
위 형태처럼 클래스 인스턴스 생성 시 new 연산자로 호출됨  

자바스크립트도 new 연산자가 존재하지만 자바스크립트의 new는 의미상 클래스 지향적인 기능과 상관이 없음  
자바스크립트의 생성자 - 앞에 new 연산자가 있을 때 호출되는 일반 함수에 불과함  
클래스의 인스턴스화 기능 없으며, 특별한 형태의 함수도 아님  
'생성자 함수'가 아니라, '함수를 생성하는 호출'  

함수 앞에 new를 붙여 생성자 호출 시 다음의 과정이 발생
1. 새 객체 생성
2. 새로 생성된 객체의 Prototype이 연결됨
3. 새로 생성된 객체는 해당 함수 호출 시 this로 바인딩됨
4. 이 함수가 자신의 또 다른 객체를 반환하지 않는 한 new와 함께 호출된 함수는 자동으로 새로 생성된 객체를 반환함  

1, 3, 4와 관련한 설명(2는 프로토타입과 관련)
```javascript
function foo(a) {
  this.a = a;
}
var bar = new foo(2);
console.log(bar.a);
```
앞에 new를 붙여 foo()를 호출, 새로 생성된 객체는 foo 호출 시 this에 바인딩됨  
결국 new는 함수 호출 시 this를 새 객체와 바인딩하는 방법 -> new 바인딩

## 2.3 모든 건 순서가 있는 법
여러 개의 규칙이 중복될 시의 우선순위 존재  
기본 바인딩이 가장 뒷순위  
암시적 바인딩과 명시적 바인딩 순위를 확인하기 위한 코드
```javascript
function foo() {
  console.log(this.a);
}
var obj1 = {
  a: 2,
  foo: foo
};
var obj2 = {
  a: 3,
  foo: foo
};
obj1.foo(); //2
obj2.foo(); //3

obj1.foo.call(obj2); //3
obj2.foo.call(obj1); //2
```
명시적 바인딩이 암시적 바인딩보다 우선순위가 높음 -> 암시적 바인딩 확인 전 먼저 명시적 바인딩이 적용됐는지 살펴야 함  
new 바인딩
```javascript
function foo() {
  console.log(this.a);
}
var obj1 = {
  foo: foo
};
var obj2 = {};
obj1.foo(2);
console.log(obj1.a); //2

obj1.foo.call(obj2, 3);
console.log(obj2.a); //3

var bar = new obj1.foo(4);

console.log(obj1.a); //2
console.log(bar.a); //4
```
new 바인딩이 암시적 바인딩보다 우선순위가 높음  

new 바인딩과 명시적 바인딩 간 우선순위  
(new와 call, apply는 동시에 사용 불가 -> 하드 바인딩을 통해 테스트)  
바인딩의 물리적 작동원리 - Function.prototype.bind()는 어떤 종류든 자체 this 바인딩을 무시하고 주어진 바인딩을 적용하여 하드 코딩된 새 래퍼 함수를 생성함  
따라서 명시적 바인딩의 한 형태인 하드 코딩이 new 바인딩보다 우선순위가 높고 new로 오버라이드는 불가
```javascript
function foo(something) {
  this.a = something;
}

var obj1 = {};

var bar = foo.bind(obj1);
bar(2);
console.log(obj1.a); //2

var baz = new bar(3);
console.log(obj1.a); //2
console.log(baz.a); //3
```
bar는 obj1에 하드 바인딩. new bar(3) 실행 후에도 obj1.a 값은 3으로 바뀌지 않음  
대신 obj1에 하드 바인딩된 bar() 호출은 new로 오버라이드 가능  
또한 new가 적용되므로 새로 만들어진 객체가 baz에 할당되고 실제 baz.a 값은 3이 됨  

bind 헬퍼 함수
```javascript
function bind(fn, obj) {
  return function() {
    fn.apply(obj, arguments);
  };
}
```
new 연산자를 써서 obj로 하드 바인딩된 것을 오버라이드할 방법이 없음  

ES5에 내장된 Function.prototype.bind() 을 사용한 폴리필  
new와 함께 사용되는 하드 바인딩 함수라는 점에서 내장 bind() 함수와는 다름
```javascript
if(!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== "function") {
      throw new TypeError (
        "Function.prototype.bind - 바인딩하려는 대상이" + "호출 가능하지 않습니다."
      );
    }

    var aArgs = Array.prototype.clice.call(arguments, 1),
        fToBind = this,
        fNOP = function() {},
        fBound = function() {
          return fToBind.apply(
            (
              this instanceof fNOP && oThis ? this : oThis
            ),
            aArgs.concat(
              Array.prototype.slice.call(arguments)
            );
          );
          fNOP.prototype = this.prototype;
          fBound.prototype = new fNOP();

          return fBound;
        };
  }
}
```
하드 바인딩 함수가 new로 호출되어 this가 새로 생성된 객체로 세팅됐는지 조사해보고 맞으면 하드 바인딩에 의한 this를 버리고 새로 생성된 this를 대신 사용  

new로 하드 바인딩을 오버라이드하는 이유  
기본적으로 this 하드 바인딩을 무시(new로 객체를 생성)하는 함수를 생성하여 함수 인자를 전부 또는 일부만 미리 세팅해야 할 때 유용  
bind() 함수는 최초 this 바인딩 이후 전달된 인자를 원 함수의 기본 인자로 고정하는 역할(부분 적용. 커링의 일종)
```javascript
function foo(p1, p2) {
  this.val = p1 + p2;
}
var bar = foo.bind(null, "p1");
var baz = new bar("p2");

baz.val; //p1p2
```

### 2.3.1 this 확정 규칙
1. new로 함수를 호출: new 바인딩 -> 맞으면 새로 생성된 객체가 this
```javascript
var bar = new foo();
```
2. call과 apply로 함수를 호출: 명시적 바인딩. bind 하드 바인딩 내부에 숨겨진 형태로 호출 -> 맞으면 명시적으로 지정된 객체가 this
```javascript
var bar = foo.call(obj2);
```
3. 함수를 콘텍스트, 즉 객체를 소유 또는 포함하는 형태로 호출: 암시적 바인딩 -> 맞으면 이 콘텍스트 객체가 this
```javascript
var bar = obj1.foo();
```
4. 그 외의 경우 this는 기본값(엄격 모드는 undefined, 그 외는 전역 객체)으로 세팅: 기본 바인딩
```javascript
 var bar = foo();
 ```

 ## 2.4 바인딩 예외

 ### 2.4.1 this 무시
 call, apply, bind 메서드 첫 번째 인자로 null 도는 undefined를 넘기면 this 바인딩이 무시되고 기본 바인딩 규칙이 적용됨
 ```javascript
function foo() {
  console.log(this.a);
}
var a = 2;
foo.call(null); //2
```
apply()는 함수 호출 시 다수의 인자를 배열 값으로 펼쳐 보내는 용도로 주로 쓰임. bind()도 유사한 방법으로 인자들을 커링하는 메서드로 많이 사용됨
```javascript
function foo(a, b) {
  console.log("a:" + a + " b:" + b);
}
// 인자들을 배열 형태로 펼침
foo.apply(null, [2, 3]); //a:2, b:3
// bind()로 커링
var bar = foo.bind(null, 2);
bar(3); //a:2, b:3
```
apply, bind 모두 반드시 첫 번재 인자로 this 바인딩을 지정해야 함  
this가 로직상 아무 값이어도 상관 없다면 null로 전달하는 것이 합리적  
그러나 null을 자주 사용하는 것은 리스크 존재  
어떤 함수 호출 시 null을 전달했는데 이 함수가 내부적으로 this를 참조한다면 기본 바인딩이 적용되어 전역 변수를 참조하거나 그것으로 변경하는 예기치 못한 일 발생 위험 - 버그 양산 가능성  

ES6의 펼침 연산자 - this 바인딩이 필요 없으면 아예 구문에서 빼버리고 apply() 없이 인자를 배열 형태로 펼칠 수 있음  
foo(...[1, 2])는 foo(1, 2)와 같음

#### 더 안전한 this
더 안전하게 진행하기 위해 부작용과 무관한 객체를 this로 바인딩  
DMZ 객체 - 내용이 없으면서 전혀 위임되지 않은 객체  
DMZ 객체 전달 -> 받는 쪽에서 this를 사용하더라도 대상은 빈 객체로 한정되므로 전역 객체를 건드리는 일이 없음  
Object.create(null)로 생성 - {}와 비슷하나 Object.prototype으로 위임하지 않으므로 {}보다 '더 텅빈' 객체
```javascript
function foo(a, b) {
  console.log("a:" + a + " b:" + b);
}

var o = Object.create(null);
// 인자들을 배열 형태로 펼침
foo.apply(o, [2, 3]); //a:2, b:3
// bind()로 커링
var bar = foo.bind(o, 2);
bar(3); //a:2, b:3
```

### 2.4.2 간접 레퍼런스
함수 호출 시 무조건 기본 바인딩 규칙이 적용됨  
간접 레퍼런스는 할당문에서 가장 빈번하게 발생
```javascript
function foo() {
  console.log(this.a);
}
var a = 2;
var o = { a: 3, foo: foo };
var p = { a: 4 };

o.foo(); //3
(p.foo = o.foo)(); //2
// 크롬 - 3, 2 출력
// node.js - 3, undefined 출력
```
할당 표현식 p.foo = o.foo의 결과값은 원 함수 객체의 레퍼런스 - 실제 호출부는 p.foo, o.foo가 아니라 foo(). 따라서 기본 바인딩 규칙이 적용됨  
(엄격 모드 여부에 따라 기본 바인딩 값이 달라짐)

## 2.4.3 소프트 바인딩
함수 호출 시 의도와 다르게 기본 바인딩 규칙이 적용되는 것을 막기 위해 하드 바인딩 사용(this를 강제)  
그러나 하드 바인딩은 함수 유연성을 저하시킴 - this를 암시적 바인딩하거나 다시 명시적 바인딩 하는 등의 수동 오버라이드가 불가  

소프트 바인딩
```javascript
if (!Function.prototype.softBind) {
  Function.prototype.softBind = function(obj) {
    var fn = this;
    var curried = [].slice.call(arguments, 1);
    var bound = function() {
      return fn.apply(
        (!this || this === (window || global)) ? obj : this
        curried.concat.apply(curried, auguments)
      );
    };
    bound.prototype = Object.create(fn.prototype);
    return bound;
  };
}
```
ES5의 bind() 유틸리티와 유사  
호출 시점에 this를 체크하는 부분이서 주어진 함수를 래핑하여 전역 객체나 undefined일 경우 미리 준비한 대체 기본 객체로 세팅, 그 외의 경우 this는 손대지 않음  
선택적 커링 기능도 존재
사용법
```javascript
function foo() {
  console.log("name: " + this.name);
}
var obj = { name: "obj" },
  obj2 = { name: "obj2" },
  obj3 = { name: "obj3" };
var fooOBJ = foo.softBind(obj);
fooOBJ();

obj2.foo = foo.softBind(obj);
obj2.foo();

fooOBJ.call(obj3);
setTimeout(obj2.foo, 10);
```
소프트 바인딩이 탑재된 foo() 함수는 this를 obj2나 obj3으로 수동 바인딩 가능, 기본 바인딩 규칙이 적용되어야 할 때는 다시 obj로 되돌림

## 2.5 어휘적 this
ES6부터는 4가지 규칙을 따르지 않는 함수 존재 - 화살표 함수  
4가지 표준 규칙 대신 enclosing scope를 보고 this를 알아서 바인딩함  

화살표 함수의 렉시컬 스코프를 나타낸 예제
```javascript
function foo() {
  return (a) => {
    console.log(this.a); // this는 어휘적으로 foo()에서 상속됨
  };
}
var obj1 = {
  a: 2
};
var obj2 = {
  a: 3
};

var bar = foo.call(obj1);
bar.call(obj2); //2
```
foo() 내부에서 생성된 화살표 함수는 foo() 호출 당시 this를 무조건 어휘적으로 포착  
foo()는 obj1에 this가 바인딩되므로 bar의 this 역시 obj1로 바인딩됨  
화살표 함수의 어휘적 바인딩은 오버라이드할 수 없음  

화살표 함수는 이벤트 처리기나 타이머 등의 콜백에 주로 쓰임
```javascript
function foo() {
  setTimeout(() => {
    console.log(this.a);
  }, 100);
}
var obj = {
  a: 2
};
foo.call(obj); //2
```
화살표 함수는 this를 확실히 보장하는 수단으로 bind()를 대체할 수 있으나, 기존의 this 체계를 포기하는 것  
ES6 이전에도 유사한 기능 존재
```javascript
function foo() {
  var self = this;
  setTimeout(function() {
    console.log(self.a);
  }, 100);
}
var obj = {
  a: 2
};
foo.call(obj);
```
화살표 함수 또는 self = this 형태 코드 사용 시 다음 중 하나를 선택
1. 렉시컬 스코프만 사용하고 this 스타일 코드는 사용하지 않음
2. 필요하다면 bind()까지 포함하여 완전한 this 스타일의 코드를 구사하되, self = this나 화살표 함수 같은 '어휘적 this' 꼼수는 삼가야 함
3. 두 스타일을 적절히 혼용하는 것은 가능. 그러나 동일 함수 내에서 같은 것을 찾는데 다른 스타일이 섞여 있다면 관리와 이해에 어려움 유발  