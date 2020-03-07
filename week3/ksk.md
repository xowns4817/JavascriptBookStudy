## 4.4 암시적 변환
부수 효과(변환)가 명확하지 않게 숨겨진 형태로 일어나는 타입 변환  
분명하지 않은 타입변환  
목적: 코드의 장황함, 보일러플레이트, 불필요한 상세 구현을 줄이는 것

### 4.1.1 '암시적'의 의미
엄격한 타입 언어상 이론적 의사코드의 예: 임의의 타입 y값을 SomeType으로 바꾸기  
SomeType x = SomeType(AnotherType(y))  
y의 값과 무관하게 곧바로 SomeType으로 변환될 수 없음 - 중간단계 필요  
먼저 AnotherType으로 변환된 뒤 SomeType으로 최종 변환  
=> 상세한 변화과정이 표면적으로 드러날 필요 없음  
=> 중간 단계가 숨겨짐으로써 코드 가독성 향상 및 세부적인 구현부의 추상화에 도움

### 4.4.2 문자열 <-> 숫자
+연산자: 숫자의 덧셈, 문자열 접합
```javascript
var a = "42";
var b = "0";

var c = 42;
var d = 0;

console.log(a + b);
console.log(c + d);
```
+연산자에 의한 문자열 접합과 숫자 간 덧셈의 차이  
피연산자가 한쪽 또는 양쪽 모두 문자열인지 아닌지에 따라 문자열 붙이기 여부가 결정되는 것이 아님
```javascript
var a = [1, 2];
var b = [3, 4];
console.log(a + b);
```
피연산자 모두 문자열이 아님에도 문자열로 강제변환된 후에 접합  
-> ToNumber 추상 연산이 객체를 다루는 방법과 일치  
valueOf()에 배열을 넘기면 단순 원시 값을 반환할 수 없으므로 다음으로 toString()이 처리  
두 배열은 각각 "1, 2", "3, 4"가 되고 +에 의해 두 문자열이 합쳐져 최종적으로 "1, 23, 4"가 됨  
```javascript
var a = 42;
var b = a + "";
console.log(b);
```
숫자는 공백 문자열 ""와 더하면 문자열로 강제변환됨  
a + ""는 valueOf()에 값을 전달하여 호출하고 그 결과값은 ToString 추상연산을 통해 문자열로 변환됨  
그러나 String(a)는 toString()을 직접 호출함  
원시 숫자 값이 아닌 객체라면 결과값이 달라질 수 있음
```javascript
var a = {
  valueOf: function() { return 42; },
  toString: function() { return 4; }
};
console.log(a + "");
console.log(String(a));
```
valueOf()와 toString()을 직접 구현한 객체가 있다면 강제변환 과정에서 결과값이 달라질 수 있음을 유의  

문자열 -> 숫자
```javascript
var a = "3.14";
var b = a - 0;
console.log(b);
```
-, *, / 연산자는 숫자 뺄셈, 곱셈, 나눗셈 기능밖에 없음 -> a를 숫자로 강제변환  

객체 값에 -연산
```javascript
var a = [3];
var b = [1];
console.log(a - b);
```
+연산과 유사. 각 배열은 문자열로 강제변환된 뒤 숫자로 강제변환되고 마지막으로 -연산이 수행됨

### 4.4.3 불리언 -> 숫자
복잡한 형태의 불리언 로직을 숫자 덧셈 형태로 단순화할 때 유용

```javascript
function onlyOne(a, b, c) {
  return !!((a && !b && !c) || (!a && b && !c) || (!a && !b && c)) ;
}
var a = true;
var b = false;

var r1 = onlyOne(a, b, b);
var r2 = onlyOne(b, a, b);
var r3 = onlyOne(a, b, a);
console.log(r1, r2, r3);
```
세 인자 중 정확히 하나만 true인지 아닌지를 확인하는 함수  
true 체크 시 암시적 강제변환을 하고 최종 한환 값을 포함한 다른 부분은 명시적 강제변환  
인자 수가 많아지면 코드가 복잡해짐 -> 불리언 값을 숫자로 변환하면 쉽게 해결
```javascript
function onlyOne() {
  var sum = 0;
  for (var = 0; i < arguments.length; i++) {
    // false 값은 건너뜀
    // 0으로 취급. 그러나 NaN은 피해야 함
    if (arguments[i]) {
      sum += arguments[i];
    }
  }
  return sum == 1;
}
var a = true;
var b = false;

var r1 = onlyOne(b, a);
var r2 = onlyOne(b, a, b, b, b);
var r3 = onlyOne(b, b);
var r4 = onlyOne(b, a, b, b, b, a);
console.log(r1, r2, r3, r4);
```
true를 숫자로 강제변환하면 1  
sum += arguments[i]에서 암시적 강제변환이 발생  

명시적 강제변환 버전
```javascript
function onlyOne() {
  var sum = 0;
  for (var i = 0; i < arguments.length; i++) {
    sum += Number(!!arguments[i]);
  }
  return sum === 1;
}
```
!!arguments[i]를 통해 인자 값을 true/false로 강제변환하기 때문에 비불리언 값을 넘겨도 동작됨

### 4.4.4 불리언 값으로의 암시적 강제변환
불리언으로의 암시적 강제변환이 일어나는 표현식: 불리언이 아닌 값이 사용되면 ToBoolean 연산 규칙에 따라 불리언 값으로 암시적 강제변환됨
- if()문
- for(;;)에서 두 번째 조건
- while() 및 do~while()
- ? : 삼항 연산 시 첫 번째 조건
- || 및 &&의 좌측 피연산자
```javascript
var a = 42;
var b = "abc";
var c;
var d = null;

if(a) {
  console.log('Yes');
}
while(c) {
  console.log('Never');
}

c = d ? a : b;
console.log(c);

if((a && d) || c) {
  console.log('Yes');
}
```

### 4.4.5 &&와 || 연산자
타 언어의 '논리 연산자'로서의 기능 이상의 기능을 보유 -> '선택 연산자' 또는 '피연산자 선택 연산자'  
=> 다른 언어와 달리 실제 결과값이 논리(불리언) 값이 아니기 때문 - 두 피연산자의 값들 중 하나가 선택됨
```javascript
var a = 42;
var b = "abc";
var c = null;

console.log(a || b);
console.log(a && b);
console.log(c || b);
console.log(c && b);
```
우선 피연산자의 불리언 값을 평가, 피연산자가 비 불리언 타입이면 먼저 강제변환 후 평가를 계속  
|| 연산자는 그 결과가 true면 첫 번째 피연산자 값을, false면 두 번째 피연산자 값을 반환  
&& 연산자는 true면 두 번째 피연산자 값을, false면 첫 번째 피연산자 값을 반환  
결과값은 항상 피연산자의 값 중 하나임. 강제변환된 평가의 결과가 아님  
c && b에서 c는 null이므로 false. 그러나 && 표현식은 평과 결과인 false가 아니라 c의 값인 null에 의해 판별  
다음의 과정으로 이해
```javascript
var a = 42;
var b = "abc";

var r1 = a || b;
var r2 = a ? a : b;

var r3 = a && b;
var r4 = a ? b : a;

console.log(r1, r2);
console.log(r3, r4);
```
활용 예시
```javascript
function foo(a, b) {
  a = a || "hello";
  b = b || "world";

  console.log(a + " " + b);
}
foo();
foo("Oh my", "God!");

// 주의
foo("That's it!", "");
```
주의  
두 번째 인자가 false값이므로 b = b || "world"에서 디폴트 값 "world"가 할당  
falsy값은 무조건 건너뛸 경우에만 사용. 그렇지 않을 시 조건 평가식을 삼항 연산자로 더욱 명시적으로 지정해야 함  

가드연산자: &&연산자의 특성  
첫 번째 피연산자의 평가 결과가 true일 때에만 두 번째 피연산자를 선택  
첫 번째 표현식이 두 번째 표현식의 '가드' 역할
```javascript
function foo() {
  console.log(a);
}
var a = 42;
a && foo();
```
a가 true일 때에민 foo()가 호출됨  

if문 또는 for문 상에서의 복합 논리 표현식 작동  
먼저 복합 표현식이 평가된 후 불리언으로 암시적 강제변환이 일어남
```javascript
var a = 42;
var b = null;
var c = "foo";

if (a && (b || c)) {
  console.log("Yes");
}
```
a && (b || c) 표현식의 실제 결과는 true가 아닌 "foo"  

### 4.4.6 심벌 강제변환
심벌 -> 문자열의 명시적 강제변환은 허용되나 암시적 강제변환은 금지, 시도만 해도 에러 발생
```javascript
var s1 = Symbol("Good");
var sb1 = String(s1);
console.log(sb1);

var s2 = Symbol("bad");
var sb2 = s2 + "";
console.log(sb2);
```
심벌 값은 숫자로 변환되지 않음(양방향 모두 에러)  
불리언 값으로는 명시적/암시적 강제변환(항상 true) 가능  

## 4.5 느슨한/엄격한 동등 비교
느슨한 동등 비교는 == 연산자, 엄격한 동등 비교는 === 연산자를 사용  
동등함 비교 시 ==는 강제변환을 허용, ===는 강제변환을 허용하지 않음

### 4.5.1 비교 성능
타입이 같은 두 값의 동등 비교 시, ==와 ===는 동일한 알고리즘으로 동작  
강제변환이 필요하다면 느슨한 동등 연산자를, 필요하지 않다면 엄격한 동등 연산자를 사용

### 4.5.2 추상 동등 비교
비교할 두 값이 같은 타입이라면 값에 대한 동등 비교  
값의 동등함에 대한 예외
- NaN은 그 자신과도 동등하지 않음
- +0과 -0은 동등하지 않음  
객체의 느슨한 동등비교 시 두 객체가 정확히 똑같은 값에 대한 참조일 경우에만 동등

#### 문자열 -> 숫자
```javascript
var a = 42;
var b = "42";

console.log(a === b);
console.log(a == b);
```
느슨한 동등 비교 시 피연산자의 타입이 다르면, 비교 알고리즘에 의해 한쪽 또는 양쪽 피연산자 값이 알아서 암시적 강제변환됨  
- Type(x)가 Number고 Type(y)가 String이면, x == ToNumber(y) 비교 결과를 반환
- Type(x)가 String이고 Type(y)가 Number면, ToNumber(x) == y 비교 결과를 반환  
명세 상, 문자열이 숫자로 강제변환: 강제변환은 ToNumber 추상 연산이 담당  

#### 불리언 변환
```javascript
var a = "42";
var b = true;
console.log(a == b);

var c = true;
var d = "42";
console.log(c == d);
```
- Type(x)가 불리언이면 ToNumber(x) == y의 비교 결과를 반환
- Type(y)가 불리언이면 x == ToNumber(y)의 비교 결과를 반환  
ToBoolean은 전혀 개입하지 않으며 숫자 값의 true/false 여부는 == 연산과는 전혀 무관  
==의 피연산자 한쪽이 불리안 값이면 해당 값이 먼저 숫자로 강제변환됨

===는 true/false의 강제변환을 허용하지 않음 => 불리언 비교 시 느슨한 동등비교는 사용하지 않아야 함
```javascript
var a = "42";

if (a == true) {
  console.log("1");
}

if (a === true) {
  console.log("2");
}

if (a) {
  console.log("3");
}

if (!!a) {
  console.log("4");
}

if (Boolean(a)) {
  console.log("5");
}
```

#### null -> undefined
null과 undefined 간 느슨한 동등비교 시 암시적 강제변환 발생  
- x가 null이고 y가 undefined면 true 반환
- x가 undefined이고 y가 null이면 true 반환  

null과 undefined의 느슨한 동등비교 시 서로에게 타입을 맞춤. 상호 암시적인 강제변환 발생
```javascript
var a = null;
var b;

console.log(a == b);
console.log(a == null);
console.log(b == null);

console.log(a == false);
console.log(b == false);
console.log(a == "");
console.log(b == "");
console.log(a == 0);
console.log(b == 0);
```
null <-> undefined 강제변환은 안전하고 예측 가능하며, 다른 값과의 비교 결과 긍정 오류 가능성이 없음  
동일한 값으로 취급하는 강제변환은 권장  
가독성이 좋으며, 안전하게 작동하는 암시적 강제변환의 예시  

#### 객체 -> 비객체
- Type(x)가 String 또는 Number고 Type(y)가 객체라면, x == ToPrimitive(y)의 비교 결과를 반환
- Type(x)가 Object이고 Type(y)가 String 또는 Number라면, ToPrimitive(x) == y의 비교 결과를 반환
```javascript
var a = 42;
var b = [42];

console.log(a == b);
```
[42]는 ToPrimitive 연산 시 "42"  
"42" == 42 -> 42 == 42

==알고리즘의 ToPrimitive 강제변환: 언박싱과 관련
```javascript
var a = "abc";
var b = Object(a); // new String(a)와 같음

console.log(a === b);
console.log(a == b);
```
b는 ToPrimitive 연산으로 "abc" 값(단순 스칼라 원시값)으로 강제변환(언박싱), a와 동일하므로 a == b는 true  

== 알고리즘에서 더 우선하는 규칙 존재
```javascript
var a = null;
var b = Object(a);
console.log(a == b);

var c = undefined;
var d = Object(c);
console.log(c == d);

var e = NaN;
var f = Object(e); // new Number(e)와 같음
condole.log(e == f);
```
null과 undefined는 객체 래퍼가 따로 없으므로 박싱이 불가능  
-> Object(null)은 Object()로 해석되어 일반 객체가 생성됨  
NaN은 Number로 박싱되지만 ==를 만나 언박싱되면 조건식이 NaN == NaN이 되어 결과는 false

### 4.5.3 희귀 사례
강제변환 시 발생할 수 있는 버그  

내장 네이티브 프로토타입의 변경 시도
```javascript
Number.prototype.valueOf = function() {
  return 3;
}
var yn = new Number(2) == 3;
console.log(yn);
```
2 == 3의 예시와는 무관 - 2, 3 둘 다 원시 숫자 값이기 때문에 곧바로 비교 가능 -> Number.prototype.valueOf()는 호출되지 않음  
그러나 new Number(2)는 무조건 ToPrimitive 강제변환 후 valueOf()를 호출

```javascript
var a = 1;
if (a == 2 && a == 3) {
  console.log('No');
}
```
a가 2이면서 동시에 3이라는 논리가 아님  
두 표현식 중 a == 2가 a == 3보다 먼저 평가됨

valueOf()의 부수 효과 부여
```javascript
var i = 2;
Number.prototype.valueOf = function() {
  return i++;
}

var a = new Number(42);

if (a == 2 && a == 3) {
  console.log('Yes');
}
```
위의 코드는 적절한 사용의 예시가 아님. 강제변환 반대의 근거로 사용되기에 부적절

#### Falsy 비교
긍정 오류
```javascript
console.log("0" == null);
console.log("0" == undefined);
console.log("0" == false);  // true
console.log("0" == NaN);
console.log("0" == 0);
console.log("0" == "");

console.log(false == null);
console.log(false == undefined);
console.log(false == NaN);
console.log(false == 0);  // true
console.log(false == ""); // true
console.log(false == []); // true
console.log(false == {});

console.log("" == null);
console.log("" == undefined);
console.log("" == NaN);
console.log("" == 0);   // true
console.log("" == []);  // true
console.log("" == {});

console.log(0 == null);
console.log(0 == undefined);
console.log(0 == NaN);
console.log(0 == []);   // true
console.log(0 == {});
```

```javascript
console.log([] == ![]);
```
!단항 연산자: 불리언 값으로 명시적 강제변환  
-> [] == ![] => [] == false

```javascript
console.log(2 == [2]);
console.log("" == [null]);
```
[2]와 [null]은 ToPrimitive에 의해 좌변과 비교 가능한 원시값으로 강제변환됨  
배열의 valueOf()는 배열 자신을 반환, 강제변환 시 배열을 문자열화  
-> [2] => "2", [null] => ""

```javascript
console.log(0 == "\n");
```
"", "\n"은 ToNumber를 경유하여 0으로 강제변환

24가지 사례 중 true가 나오는 7가지  
의미 없는 비교 - 사용하지 말 것
```javascript
console.log("0" == false);
console.log(false == 0);
console.log(false == "");
console.log(false == []);
console.log("" == 0);
console.log("" == []);
console.log(0 == []);
```

#### 암시적 강제변환의 안전한 사용법
동등 비교 원칙
- 피연산자 중 하나가 true/false일 가능성이 있으면 절대 == 연산자를 사용해서는 안됨
- 피연산자 중 하나가 [], "", 0이 될 가능성이 있으면 가급적 == 연산자를 사용해서는 안됨  
위의 상황이라면 == 대신 ===를 사용하여 의도하지 않은 강제변환을 차단  
결론: 강제변환의 허용 여부가 == 또는 ===의 사용을 결정함

## 4.6 추상 관계 비교
관계 비교 시 ToPrimitive 강제변환 실시로 시작  
어느 한쪽이라도 문자열이 아닐 경우 양쪽 모두 ToNumber로 강제변환하여 숫자값으로 만들어 비교
```javascript
var a = [42];
var b = ["43"];

console.log(a < b);
console.log(b < a);
```

비교 대상이 모두 문자열 값이면, 각 문자를 단순 어휘 비교(알파벳 순)
```javascript
var a = ["42"];
var b = ["043"];
console.log(a < b);
```
배열
```javascript
var a = [4, 2];
var b = [0, 4, 3];
console.log(a < b);
```
Object
```javascript
var a = { b: 42 };
var b = { b: 43 };
console.log(a < b);
```
a와 b 모두 [object Object]로 변환되어 어휘적인 비교 불가

```javascript
var a = { b: 42 };
var b = { b: 42 };

console.log(a < b);
console.log(a == b); // 별개의 객체 비교이기 때문에 false
console.log(a > b);

console.log(a <= b);
console.log(a >= b);
```
a <= b의 경우 b < a의 결과를 부정하도록 기술됨  
b < a가 false이므로 a <= b는 true  

자바스크립트의 엔진은 <=를 '더 크지 않은'의 의미로 해석  
동등 비교에는 '엄격한 관계 비교'는 없음 - 비교 전 a와 b 모두 명시적으로 동일한 타입임을 확실히 하는 것만이 관계 비교 시 암시적 강제변환을 원천봉쇄할 수 있음  
조심해서 관계비교를 해야하는 상황에서는 비교 대상 값들을 명시적으로 강제변환해두는 것이 안전
```javascript
var a = [42];
var b = "043";

console.log(a < b);
console.log(Number(a) < Number(b));
```

# 5 문법
자바스크립트 언어에서 구문이 어떻게 작동하는가  

## 5.1 문과 표현식
자바스크립트에서 모든 표현식(expression)은 단일한 특정한 결과값으로 계산됨  
```javascript
var a = 3 * 6;
var b = a;
b;
```
3 * 6은 표현식. 두 번째, 세 번째 줄 또한 표현식  
각 라인은 각각 표현식이 포함된 문(statement)  
var a = 3 * 6, var b = a 두 문은 각각 변수를 선언하므로 선언문(declaration statement)이라고 함  
앞에 var가 빠진 a = 3 * 6, b = a는 할당 표현식(assignment expression)이라고 함  
세 번째 줄은 b가 표현식의 전부지만 이것 또한 완전한 문. 이러한 형태를 표현식 문(expression statement)이라고 함

### 5.1.1 문의 완료 값
모든 문은 완료 값을 가지고 있음  

var b = a의 완료 값  
b = a는 할당 이후의 값(18)  
var 문 자체의 완료 값은 undefined  
콘솔에서 문 실행 시 undefined를 출력 - 콘솔은 실행한 문의 완료 값을 보고함  
{ } 블록의 경우, 내부의 가장 마지막 문/표현식의 완료 값을 자신의 완료 값으로 반환
```javascript
// 콘솔 또는 REPL에서 실행
var b;
if (true) {
  b = 4 + 38;
}
```
블록 내 마지막 문 b = 4 + 38의 완료 값이 42이므로 if 블록의 완료 값도 42를 반환  
즉, 블록의 완료 값은 내부에 있는 마지막 문의 값을 암시적으로 반환한 값  

다음 코드는 작동하지 않음: 문의 완료 값을 포착하여 다른 변수에 할당하기
```javascript
// 콘솔 또는 REPL에서 실행
var a, b;
a = if (true) {
  b = 4 + 38;
}
```
완료 값을 포착하려면 eval() 함수를 사용(eval 사용은 권장되지 않음)
```javascript
// 콘솔 또는 REPL에서 실행
var a, b;
a = eval("if (true) { b = 4 + 38; }");
a;
```
ES7 명세에는 do 표현식이 제안됨
```javascript
// 크롬 콘솔 및 node REPLE에서 실행되지 않음
var a, b;
a = do {
  if (true) {
    b = 4 + 38;
  }
};
a;
```
do{} 표현식은 블록 실행 후 블록 내 마지막 문의 완료 값을 do 표현식 전체의 완료 값으로 반환  
인라인 함수 표현식 안에 감싸서 명시적으로 반환할 필요 없이 문을 표현식처럼 다룸

### 5.1.2 표현식의 부수 효과
대부분의 표현식에는 부수 효과가 없음
```javascript
var a = 2;
var b = a + 3;
```
a + 3 자체는 a 값을 바꾸는 등의 부수 효과는 없음. 단지 b = a + 3 문에서 결과값 5가 b에 할당될 뿐임  

부수 효과를 가진 표현식의 예
```javascript
function foo() {
  a = a + 1;
}
var a = 1;
foo(); // 결과값: undefined, 부수효과: a가 변경됨
```
```javascript
var a = 42;
var b = a++;
```
a++의 역할 2가지: a의 현재 값 42를 반환, a 값을 1 증가

++연산자의 부수효과에 의한 혼동 가능성
```javascript
var a = 42;
var b = a++;

console.log(a);
console.log(b);
```

증가/감소 연산자: 전위/후위 연산자로 사용됨
```javascript
var a = 42;

console.log(a++);
console.log(a);
console.log(++a);
console.log(a);
```
++를 전위 연산자로 사용하면 표현식으로부터 값이 반환되기 전에 부수 효과(1 증가)가 발생  
후위 연산자로 사용 시 값을 반환한 이후에 부수 효과가 발생됨

후위연산 ++식을 ()로 감싸도 부수효과의 캡슐화는 불가능
```javascript
var a = 42;
var b = (a++);

console.log(a);
console.log(b);
```

콤마 연산자를 사용하면 다수의 개별 표현식을 하나의 문으로 연결 가능
```javascript
var a = 42, b;
b = (a++, a);

console.log(a);
console.log(b);
```
a++, a 표현식은 두 번째 a 표현식을 첫 번째 a++ 표현식에서 부수 효과가 발생한 이후에 평가  

delete 연산자: 부수 효과 발생  
객체의 프로퍼티를 없애거나 배열에서 슬롯을 제거할 때 사용  
단독 문(standalone statement)으로 더 많이 사용됨
```javascript
var obj = {
  a: 42
};
console.log(obj.a);
console.log(delete obj.a) // true
console.log(obj.a);
```
delete 연산자의 결과값: 유효한/허용된 연산일 경우 true, 그 외에는 false  
프로퍼티 또는 배열 슬롯을 제거하는 것이 부수 효과  

=할당 연산자
```javascript
var a;
a = 42;
a;
```
a=42문의 실행 결과는 할당된 값 42. a에 할당하는 자체가 본질적으로 부수효과  

할당 표현식/문 실행 시 할당된 값이 완료 값이 되는 작동 원리는 연쇄 할당문에서 특히 유용
```javascript
var a, b, c;
a = b = c = 42;
```

```javascript
function vowels(str) {
  var matches;

  if (str) {
    //모든 모음 추출
    matches = str.match(/[aeiou]/g);

    if (matches) {
      return matches;
    }
  }
}
console.log(vowels("Hello World"));
```
할당 연산자의 부수효과를 이용하여 수정
```javascript
function vowels(str) {
  var matches;

  if (str && (matches = str.match(/[aeiou]/g))) {
    return matches;
  }
}
console.log(vowels("Hello World"));
```

### 5.1.3 콘텍스트 규칙
같은 구문도 위치와 방법에 따라 다른 의미를 갖는 경우가 있음

#### 중괄호
자바스크립트에서 중괄호가 나오는 경우

##### 객체 리터럴
```javascript
// bar(): 앞에서 정의된 함수
var a = {
  foo: bar()
}
```

##### 레이블
```javascript
// bar(): 앞에서 정의된 함수
{
  foo: bar()
}
```
{}는 평범한 코드 블록. 문법적으로 문제 없으며, let 블록 스코프 선언과 함께 쓰이면 유용  
for/while루프, if 조건 등에 붙어있는 코드 블록과 기능적으로 유사  
레이블 점프: goto 와 유사한 기능. continue와 break문이 선택적으로 특정 레이블을 받아 goto처럼 프로그램의 실행흐름을 이동시킴
```javascript
{
  foo: for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      // 두 루프의 반복자가 같을 때마다 바깥쪽 루프를 continue
      if (j == i) {
        // 다음 순회 시 'foo'가 붙은 루프로 점프
        continue foo;
      }

      // 홀수 배수는 건너뜀
      if ((j * i) % 2 == 1) {
        continue;
      }
      console.log(i, j);
    }
  }
}
```
continue foo는 "foo라는 레이블 위치로 이동하여 계속 순회하라"는 의미가 아니라 "foo라는 레이블이 붙은 루프의 다음 순회를 계속하라"라는 의미. 따라서 임의적인 goto와는 다름

레이블 break 사용
```javascript
{
  foo: for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if ((i * j) >= 3) {
        console.log("stop", i, j);
        break foo;
      }
      console.log(i, j);
    }
  }
}
```
break foo: "foo라는 레이블 위치로 이동하여 계속 순회하라"는 의미가 아니라 "foo라는 레이블이 붙은 바깥쪽 루프/블록 밖으로 나가 그 이후부터 계속하라"는 의미  
레이블 없은 break로 작성하려면 추가적인 함수 필요  
공유 스코프 변수 접근 등 고려사항 때문에 코드가 복잡해지고 혼란스러워질 수 있음  

비 루프 블록에 적용 - break만 참조 가능  
레이블 break를 통해 레이블 블록 밖으로 나가는 것은 가능, 비 루프 블록을 continue하거나 레이블 없는 break로 블록을 빠져나가는 것을 불가
```javascript
function foo() {
  bar: {
    console.log("Hello");
    break bar;
    console.log("no exec");
  }
  console.log("world");
}
foo();
```
레이블 루프/블록은 가급적 사용하지 않는 것이 좋음 - 함수 호출이 더 유용  

JSON  
{ "a": 42 } 콘솔 입력 - 에러 발생
자바스크립트 레이블은 따옴표로 감싸면 안됨  
JSON은 자바스크립트 구문의 하위집합이지만 그 자체로 올바른 자바스크립트 문법은 아님

##### 블록
```javascript
// 둘 다 결과 같음. 책의 설명과 달리 강제변환이 발생하지 않음
console.log([] + {});
console.log({} + []);
```

##### 객체 분해
ES6부터 분해 할당(destructuring assignment) 시 {}를 사용
```javascript
function getData() {
  return {
    a: 42,
    b: "foo"
  }
}

var { a, b } = getData();
console.log(a, b);
```
다음과 같은 의미
```javascript
var res = getData();
var a = res.a;
var b = res.b;
```
명명된 함수에도 활용 가능. 암시적인 객체 프로퍼티 할당과 비슷한 간편 구문
```javascript
function foo({ a, b, c }) {
  console.log(a, b, c);
}
foo({
  c: [1, 2, 3],
  a: 42,
  b: "foo"
});
```
{}는 전적으로 사용 콘텍스트에 따라 의미가 결정됨. 예상치 못했던 방향으로 해석되는 것을 방지하기 위해 미묘한 차이를 이해하는 것이 중요

##### else if와 선택적 블록
```javascript
if (a) {
  // ...
}
else if (b) {
  // ...
}
else {
  // ...
}
```
else if는 존재하지 않음  
if, else문은 실행문이 하나밖에 없는 경우 블록을 감싸는 {} 생략 가능  
위의 코드는 실제로 다음과 같이 파싱됨
```javascript
if (a) {
  // ...
}
else {
  if (b) {
    // ...
  }
  else {
    // ...
  }
}
```
else 이후의 if (b) {} else {} 는 단일 문이므로 {}로 감싸든 말든 상관 없음  
즉, else if 사용은 표준 스타일 가이드의 위반 사례. 단일 if문과 같이 else를 정의한 것과 같음  