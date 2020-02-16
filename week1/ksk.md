# ch1. 타입

## 자바스크립트의 내장 타입 7가지
- null
- undefined
- boolean
- number
- string
- object
- symbol

```javascript
console.log(typeof undefined === "undefined");
console.log(typeof true === "boolean");
console.log(typeof 42 === "number");
console.log(typeof "42" === "string");
console.log(typeof { life: 42} === "object");
console.log(typeof Symbol() === "symbol"); // es6
```

## typeof의 반환 값은 7가지 내장 타입과 1:1로 매칭되지 않음
null: null을 반환하지 않음
```javascript
console.log(typeof null === "object");
```
null 값의 정확한 검사 - null은 falsy한 유일한 원시 값이지만 타입은 object
```javascript
var a = null;
console.log(!a && typeof a === "object");
```
typeof function
```javascript
console.log(typeof function a(){/**/} === "function");
```

실제로는 function은 object의 하위 타입: 호출 가능한 객체

## 함수의 프로퍼티
```javascript
function a(b, c) {
  /* */
}
console.log(a.length);
```
함수의 length 프로퍼티: 함수에 선언된 인자 개수

## 배열: 객체
숫자 인덱스를 가지며, length 프로퍼티가 자동으로 관리됨
```javascript
console.log(typeof [1, 2, 3] === "object");
```
## 값, 타입
타입 강제가 존재하지 않음  
변수에 처음 할당된 값과 이후에 할당할 값이 동일한 타입일 필요는 없음  
typeof: 변수에 할당된 값의 타입을 알아봄  
typeof의 반환값 타입은 문자열  
```javascript
console.log(typeof typeof 42);
```

## 값이 없는 vs 선언되지 않은
값이 없는 변수의 값은 undefined
```javascript
var a;
var resA = typeof a;
console.log('resA', resA);
var b = 42;
var c;
b = c;

var resB = typeof b;
var resC = typeof c;
console.log('resB', resB);
console.log('resC', resC);
```

## 값이 없는 undefined와 선언되지 않은 undefined
접근 가능한 스코프에 변수가 선언되었으나 현재 아무런 값도 할당되지 않은 상태  
접근 가능한 스코프에 변수 자체가 선언조차 되지 않은 상태
```javascript
var a1;
console.log('a1', a1, typeof a1);
// console.log('b1', b1, typeof b1);
console.log('typeof a1, b1', typeof a1, typeof b1);
// 선언되지 않은 변수도 typeof로 검사하면 undefined를 출력
```

## 선언되지 않은 변수
typeof를 활용한 전역변수 체크 방법
```javascript
// if (DEBUG) {
//   console.log("디버깅을 시작합니다.");
// }
if (typeof DEBUG !== "undefined") {
  console.log("디버깅을 시작합니다.");
}
// 내장 API 기능 체크 시
if (typeof atob === "undefined") {
  atob = function(){/* */}
}
```

var atob로 선언하지 않음  
var atob로 선언할 경우 코드 실행을 건너뛰더라도 선언 자체가 최상위 스코프로 호이스팅됨  
var atob로 선언하면 다음과 같은 코드로 해석됨
```javascript
/* 
var atob;
if (typeof atob === "undefined") {
  atob = function() {}
}
*/

if (typeof atob1 === "undefined") {
  var atob1 = function(a){
    console.log(a + 1)
  }
}
atob1(1);
```

## typeof 없이 전역 변수를 체크하는 방법
```javascript
/*
if (window.DEBUG) {

}
if (!window.DEBUG) {

}
*/
```
선언되지 않은 변수 때와는 달리 어떤 객체의 프로퍼티로 접근할 때에는 그 프로퍼티가 존재하지 않아도 ReferenceError가 나지 않음  
그러나 window 객체를 통한 전역변수 참조는 삼가야 함  
전역변수가 꼭 window 객체로 호출되지는 않기 때문



## typeof의 사용
다른 코드를 복사하여 사용할 때, 특정 변수값이 정의되어 있는지 체크해야 하는 상황
```javascript
function doSomethingCool() {
  var helper = (typeof FeatureXYZ !== "undefined") ? FeatureXYZ : function(){/*기본 XYZ 기능*/}
  var val = helper();
}

(function() {
  function FeatureXYZ() {}

  function doSomethingCool() {
    var helper = (typeof FeatureXYZ !== "undefined") ? FeatureXYZ : function(){/*기본 XYZ 기능*/}
    var val = helper();
  }
  doSomethingCool();
})();
```

의존성 주입 설계 패턴 시 명시적으로 의존관계를 전달
```javascript
function doSomethingCool1(FeatureXYZ) {
  var helper = FeatureXYZ || function() {};
  var val = helper();
}
```

# ch2. 값

## 배열
배열: 다른 언어와 달리 문자열, 숫자, 객체, 다른 배열 등 어떤 타입의 값도 담을 수 있음
```javascript
var a = [1, "2", [3]];
console.log('a:', a.length, a[0], a[2][0]);
```
크기는 미리 정하지 않고도 선언 가능, 원하는 값을 바로 추가할 수 있음
```javascript
var a1 = [];
a1[0] = 1;
a1[1] = 2;
a1[2] = [3];
console.log('a1:', a1);
```
빈 슬롯이 존재하는 배열  
a2[1] = undefined로 명시적으로 값을 세팅한 것과 똑같지는 않음
```javascript
var a2 = [];
a2[0] = 1;
a2[2] = [3];
console.log('a2:', a2[1], a2.length);
```
배열의 인덱스는 숫자  
배열도 객체이기 때문에 키/프로퍼티 문자열 추가 가능(하지만 length가 증가하지 않음)
```javascript
var a3 = [];
a3[0] = 1;
a3["foobar"] = 2;
console.log('a3:', a3, a3.foobar);
// 키로 넣은 문자열 값이 10진수 숫자 타입이라면 문자열 키가 아닌 숫자 키를 사용한 것과 같은 결과
var a4 = [];
a["13"] = 42;
console.log('a4:', a.length);
```

### 유사 배열
유사배열을 진짜 배열로 바꾸기 위해 배열 유틸리티 함수를 사용  
indexOf(), concat(), forEach() 등
```javascript
function foo() {
  var arr = Array.prototype.slice.call(arguments);
  // 첫 번째 원소부터 배열 끝까지 잘라냄 => 배열 복사와 같은 의미
  arr.push("bam");
  console.log(arr);
}
foo("bar", "baz");
// es6에서는 기본 내장 함수 Array.from() 사용
function foo1() {
  var arr = Array.from(arguments);
  // 첫 번째 원소부터 배열 끝까지 잘라냄 => 배열 복사와 같은 의미
  arr.push("bam");
  console.log(arr);
}
foo1("bar", "baz");
```

## 문자열
### 문자열은 문자의 배열인가?
```javascript
var a = "foo";
var b = ["f", "o", "o"];

var al = a.length;
var bl = b.length;

var ai = a.indexOf("o");
var bi = b.indexOf("o");

var c = a.concat("bar");
var d = b.concat(["b", "a", "r"]);

console.log("a:", a, al, c);
console.log("b:", b, bi, d)

console.log(a === c);
console.log(b === d);

console.log(a[1]);
console.log(b[1]);
```
### 문자열과 문자의 배열의 차이
문자열은 불변 값, 배열은 가변 값  
문자열에서 a[1]의 형태로 특정 문자를 접근하는 방식은 모든 엔진에서 유효하지는 않음(ie의 경우 8부터 가능)  
a.charAt(1)의 형태로 접근해야 함  

문자열은 불변 값이므로 문자열 메서드는 그 내용을 바로 변경하지 않고 항상 새로운 문자열을 생성한 후 반환  
반면 대부분의 배열 메서드는 직접 해당 배열에서 원소를 수정함
```javascript
c = a.toUpperCase();
console.log(a, c);
b.push("!");
console.log(b);
```
대부분의 배열 메서드는 사실상 문자열에 사용 불가  
그러나 문자열에 대해 불변 배열 메서드는 사용 가능
// a.join; undefined
// a.map; undefined
```javascript
var c1 = Array.prototype.join.call(a, "-");
var d1 = Array.prototype.map.call(a, function(v) {
  return v.toUpperCase() + ".";
}).join("");
console.log("c1:", c1);
console.log("d1:", d1);

// reverse
// a.reverse undefined
b.reverse();
console.log("b reverse:", b);
// Array.prototype.reverse.call(a); // 실행 안됨

var ca = a.split("").reverse().join("");
console.log("ca:", ca);
```

## 숫자
숫자타입: number가 유일. 정수와 부동 소수점 숫자를 모두 포함

### 정수와 실수
```javascript
var a = 42;
var b = 42.3;
console.log(a, b);
```
소수점 앞 정수가 0이면 생략 가능
```javascript
var c = 0.42;
var d = .42;
console.log(c, d);
```
소수점 이하가 0이면 생략 가능
```javascript
var e = 42.0;
var f = 42.;
console.log(e, f);
```
10진수가 디폴트, 소수점 이하 0은 제거됨
```javascript
var g = 42.300;
var h = 42.0;
console.log(g, h);
```
아주 크거나 작은 숫자는 지수형으로 표기
```javascript
var i = 5E10;
var i_ = i.toExponential();
var j = i * i;
var k = 1 / i;
console.log(i, i_, j, k);
```
### 숫자 값은 Number.prototype 메서드로 접근 가능
toFixed() 메서드 예시: 지정한 소수점 이하 자리수까지 표시. 원래 값보다 많은 수를 넣으면 그만큼 0이 추가됨
```javascript
var aa = 42.59;
console.log(aa.toFixed(0));
console.log(aa.toFixed(1));
console.log(aa.toFixed(2));
console.log(aa.toFixed(3));
console.log(aa.toFixed(4));
```
toPrecision: 유효숫자의 개수를 지정
```javascript
console.log(aa.toPrecision(1));
console.log(aa.toPrecision(2));
console.log(aa.toPrecision(3));
console.log(aa.toPrecision(4));
console.log(aa.toPrecision(5));
console.log(aa.toPrecision(6));
```
숫자 리터럴에서 바로 접근 가능. 소수점의 . 사용시 주의(접근자가 아닌, 숫자 리터럴의 일부로 인식할 수 있음)
```javascript
// 42.toFixed(3); // error
var aa1 = (42).toFixed(3);
var aa2 = 0.42.toFixed(3);
var aa3 = 42..toFixed(3);
var aa4 = 42 .toFixed(3)
console.log(aa1, aa2, aa3, aa4);
```

### 큰 숫자: 지수형 표기
```javascript
var 천 = 1E3;
var 백십만 = 1.1E6;
console.log(천, 백십만);
```

### 진법
```javascript
var hex1 = 0xf3;
var hex2 = 0Xf3;
var oct = 0363;
console.log(hex1, hex2, hex1 === hex2, oct);
var oct61 = 0o363; // es6
var oct62 = 0O363; // es6
var bi1 = 0b11110011;
var bi2 = 0B11110011;
console.log(bi1, bi2);
```

### 작은 소수 값
부동소수점의 부작용
```javascript
console.log(0.1 + 0.2 === 0.3);
```
미세한 반올림오차(머신 입실론)를 허용공차로 처리. js에서의 머신 입실론: 2의 -52승  
es6에는 Number.EPSILON으로 미리 정의됨. 이전 브라우저에서는 다음과 같이 사용
```javascript
if(!Number.EPSILON) {
  Number.EPSILON = Math.pow(2, -52);
}
```
Number.EPSILON을 통한 동등 비교
```javascript
function numbersCloseEnoughToEqual(n1, n2) {
  return Math.abs(n1 - n2) < Number.EPSILON;
}
var n1 = 0.1 + 0.2;
var n2 = 0.3;
var res = numbersCloseEnoughToEqual(n1, n2);
var res2 = numbersCloseEnoughToEqual(0.0000001, 0.0000002);
console.log(res, res2);
```

부동 소수점 최대/최소 숫자
```javascript
console.log(Number.MAX_VALUE, Number.MIN_VALUE);
```
안전한 정수 범위: 표현한 값과 실제 값이 정확하게 일치
```javascript
console.log(Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
```

정수인지 확인(es6): Number.isInteger()
```javascript
var isNum1 = Number.isInteger(42);
var isNum2 = Number.isInteger(42.000);
var isNum3 = Number.isInteger(42.3);
console.log(isNum1, isNum2, isNum3);
// es6 이전
if (!Number.isInteger) {
  Number.isInteger = function(num) {
    return typeof num == "number" && num % 1 == 0;
  };
}
```

안전한 정수 여부
```javascript
var isSfNum1 = Number.isSafeInteger(Number.MIN_SAFE_INTEGER);
var isSfNum2 = Number.isSafeInteger(Math.pow(2, 53));
var isSfNum3 = Number.isSafeInteger(Math.pow(2, 53) - 1);
console.log(isSfNum1, isSfNum2, isSfNum3);
```

32비트 정수(부호가 있는 정수)
정수의 안전 범위: Math.pow(-2, 31) ~ Math.pow(2, 31)


## 특수 값
값 아닌 값

undefined 타입: undefined  
null 타입: null  
null: 빈 값. 이전에 값이 있었으나 현재는 없는 상태  
undefined: missing. 값을 아직 지니지 못한 상태

### undefined
식별자로 사용될 수 있음(권장하지 않음)
```javascript
function foo() {
  undefined = 2;
}
foo();
// 엄격모드에서는 불가능
function foo1() {
  "use strict";
  undefined = 2;
}
// foo1(); // error
```

모드와 상관없이 undefined라는 변수명 생성 가능
```javascript
function foo2() {
  "use strict";
  var undefined = 2;
  console.log(undefined);
}
foo2();
```

### void 연산자: 어떤 값이든 무효로 만들어 항상 결과값이 undefined가 됨
```javascript
var a = 42;
console.log(void a, a);
```
void 연산자는 어떤 표현식의 결과값이 없다는 걸 확실히 밝혀야 할 때 사용 가능

### 특수 숫자
NaN: 연산 시 두 피연산자가 다 숫자가 아닐 경우 결과값이 NaN으로 출력됨  
숫자 타입
```javascript
var aa = 2 / "foo";
console.log(aa, typeof aa);
```
 
직접비교 불가
```javascript
console.log(a == NaN);
console.log(a === NaN);
```

NaN과 NaN의 비교
```javascript
console.log(NaN === NaN);
console.log(isNaN(aa));
```

isNaN()은 인자값이 숫자인지 여부를 평가만 함
```javascript
console.log(isNaN("foo"));
```

es6: Number.isNaN()
```javascript
if (!Number.isNaN) {
  Number.isNaN = function(n) {
    return (
      typeof n === "number" && global.isNaN.isNaN(n)
      //typeof n === "number" && window.isNaN.isNaN(n)
    );
  };
}
var a1 = 2 / "foo";
var b1 = "foo";
var a2 = Number.isNaN(a1);
var b2 = Number.isNaN(b1);
console.log(a2, b2);
```

더 간단한 버전
```javascript
if (!Number.isNaN) {
  Number.isNaN = function(n) {
    return n !== n;
  }; 
}
```

### 무한대: 0으로 나눌 경우
```javascript
var num_a = 1 / 0;
var num_b = -1 / 0;
console.log(num_a, num_b);
console.log(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
```

### 0
-0 결과값이 존재  
-0을 문자열화하면 "0"  
-0과 0을 동등비교하면 true  
방향을 나타내야 하는 애플리케이션 등에서 사용. 잠재적 정보 소실 방지를 위해 0의 부호를 보존
```javascript
var z1 = 0 / 3;
var z2 = 0 * -3;
var z3 = z2.toString();
var z4 = z2 + "";
var z5 = String(z2);
console.log(z1, z2);
console.log(z3, z4, z5);
console.log(-0 === 0, 0 > -0);
```
```javascript
function isNegZero(n) {
  n = Number(n);
  return (n === 0) && (1 / n === -Infinity);
}
console.log(isNegZero(-0));
console.log(isNegZero(0 / -3));
console.log(isNegZero(0));
```
### es6에서의 동등비교
```javascript
var a22 = 2 / "foo";
var b22 = -3 * 0;
var o1 = Object.is(a22, NaN);
var o2 = Object.is(b22, -0);
var o3 = Object.is(b22, 0);
console.log(o1, o2, o3);
```
es6 이전
```javascript
if (!Object.is) {
  Object.is = function(v1, v2) {
    // -0 test
    if (v1 === 0 && v2 === 0) {
      return 1 / v1 === 1 / v2;
    }
    // NaN test
    if (v1 !== v1) {
      return v2 !== v2;
    }
    // etc
    return v1 === v2;
  };
}
```

## 값vs레퍼런스
포인터 개념은 없음  
특정 변수가 다른 변수를 참조할 수 없음  
여러 개의 레퍼런스는 공유된 단일 값을 개별적으로 참조  
값의 타입으로 값-복사, 레퍼런스-복사가 결정됨  
원시 값(null, undefined, string, number, boolean, symbol)은 값-복사 방식으로 할당/전달됨  
객체, 함수 등의 합성값은 레퍼런스 사본을 생성하여 할당/전달함

### 값 복사
```javascript
var a = 2;
var b = a;
b++;
console.log(a, b);
```
### 레퍼런스 복사: 값의 참조
```javascript
var c = [1, 2, 3];
var d = c;
d.push(4);
console.log(c, d);
```

레퍼런스는 변수가 아닌 값 자체를 가리키므로 a1 레퍼런스로 b1 레퍼런스가 가리키는 대상 변경이 불가함
```javascript
var a1 = [1, 2, 3];
var b1 = a1;
console.log(a1, b1);
b1 = [4, 5, 6];
console.log(a1, b1);
```

### 함수
함수에 a1 인자를 넘기면 인자의 레퍼런스 사본이 x에 할당됨  
x와 a1은 동일한 [1, 2, 3] 값을 가리키는 별개의 레퍼런스  
함수 내부에서 레퍼런스를 이용하여 값 자체를 변경(push)  
그 후 새 값을 할당해도 초기 래퍼런스 a1이 참조하고 있던 값에는 아무런 영향이 없음
```javascript
function foo(x) {
  x.push(4); 
  // x: [1, 2, 3, 4]
  x = [4, 5, 6];
  // x: [4, 5, 6, 7]
}
foo(a1);
console.log(a1);
```

배열을 새로 생성하여 할당하는 방식으로는 바꿀 수 없음. 기존 존재하는 배열 값만 변경  
두 변수(x, a2)가 공유한 배열을 변경
```javascript
function foo1(x) {
  x.push(4);
  x.length = 0;
  x.push(4, 5, 6, 7);
}
var a2 = [1, 2, 3];
foo1(a2);
console.log(a2);
```
값의 사본을 전달. 원본을 가리키게 하지 않음  
slice()는 새로운 배열의 사본을 생성함
```javascript
var a3 = [1, 2, 3];
foo1(a3.slice());
console.log(a3);
```
원시 값을 함성 값으로 감싼 형태  
원시 값을 래퍼런스 형태로 변경하여 래퍼런스 참조 형태로 동작하게 함
```javascript
function foo3(wrapper) {
  wrapper.a = 42;
}
var obj = {
  a: 2
}
foo3(obj);
console.log(obj.a)
```
Number 객체 래퍼로 원시 값을 박싱한 값을 인자로 전달  
공유된 객체를 가리키는 레퍼런스가 있다고 해서 공유된 원시값이 변경되지 않음  
어떤 원시 값을 지닌 객체에 대해, 그와 동일한 값을 지닌 객체가 다른 원시 값을 갖도록 변경할 수 없음
```javascript
function foo4(x) {
  x++;
}
var a4 = 2;
var b4 = new Number(a4);
foo4(b4);
console.log(b4);
```