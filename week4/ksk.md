## 5.2 연산자 우선순위
```javascript
var a = 42;
var b = "foo";
var c = [1, 2, 3];

console.log(a && b || c);
console.log(a || b && c);
```
표현식에 연산자가 여러 개 있을 경우의 규칙 -> 연산자 우선순위

```javascript
var a = 42, b;
b = (a++, a);
console.log(a, b);
```
```javascript
var a = 42, b;
b = a++, a;
console.log(a, b);
```
,연산자가 =연산자보다 우선순위가 낮음  
자바스크립트 엔진이 b = a++, a를 (b = a++), a 로 해석  
다수의 문을 연결하는 연산자로 ,를 사용 시 연산자의 우선순위가 최하위

```javascript
if (str && (matches = str.match(/[aeiou]/g))) {
  // ...
}
```
=연산자보다 &&연산자가 우선순위가 높음

```javascript
var a = 42;
var b = "foo";
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;

console.log(d);
```
```javascript
console.log(true || false && false);

console.log((true || false) && false);
console.log(true || (false && false));
```
좌 -> 우 순으로 처리되는 것이 아니라, &&가 ||보다 먼저 처리되는 규칙이 적용됨  
[연산자 우선순위](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/%EC%97%B0%EC%82%B0%EC%9E%90_%EC%9A%B0%EC%84%A0%EC%88%9C%EC%9C%84)


### 5.2.1 단락 평가
&&, || 연산자는 좌측 피연산자의 평가 결과만으로 전체 결과가 이미 결정될 경우 우측 피연산자의 평가를 건너뜀  
a && b에서 a가 false면 b는 평가하지 않음  
a || b에서 a가 true면 b를 평가하지 않음  
-> 불필요한 작업이 줄어듦  
사용 예시
```javascript
function doSomething(opts) {
  if (opts && opts.cool) {
    // ...
  }
}
```
opts && opts.cool에서 opts는 일종의 가드  
만약 opts가 존재하지 않는다면 opts.cool 표현식은 에러  
일단 opts를 먼저 단락 평가 후, 그 결과가 실패면 opts.cool은 자동으로 평가 생략, 결과적으로 에러가 발생하지 않음  

||의 경우
```javascript
function doSomething(opts) {
  if (opts.cache || primeCache()) {
    // ...
  }
}
```

### 5.2.2 삼항연산 내 논리연산
? : 연산자의 우선순위
```javascript
console.log(a && b || c ? c || b ? a : c && b : a);

console.log(a && b || (c ? c || (b ? a : c) && b : a));
console.log((a && b || c) ? (c || b) ? a : (c && b) : a);
```
||는 ? :보다 우선순위가 높음 -> (a && b || c)가 ? :보다 먼저 평가됨

### 5.2.3 결합성
우선순위가 동일한 다수의 연산자의 경우  
어느 쪽에서 그룹핑이 일어나는지에 따라 좌측 결합성 또는 우측 결합성을 지님  
결합성은 처리 방향이 좌 -> 우 또는 우 -> 좌인 것과는 전혀 다른 사항  
&&와 ||는 좌측 결합성 연산자 -> 순서대로 처리되기 때문에 결합성 방향은 중요하지 않음


결합 방향이 어느 쪽인지에 따라 완전히 다르게 작동하는 연산자  
삼항(조건)연산자
```javascript
a ? b : c ? d : e

a ? b : (c ? d : e) // 답
(a ? b : c) ? d : e
```
삼항연산자는 우측부터 결합하기 때문에 두 경우의 결과가 달라짐
```javascript
console.log(true ? false : true ? true : true);
console.log(true ? false : (true ? true : true));
console.log((true ? false : true) ? true : true);

console.log(true ? false : true ? true : false);
console.log(true ? false : (true ? true : false));
console.log((true ? false : true) ? true : false);
```

```javascript
var a = true, b = false, c = true, d = true, e = false;
console.log(a ? b : (c ? d : e));
console.log((a ? b : c) ? d : e);
```
우측 결합성을 가진 삼항연산자는 연쇄적으로 맞물릴 때 주의 필요  

=연산자: 우측 결합성
```javascript
var a ,b, c;
a = b = c = 42;
```
c = 42 -> b = ... -> a 순서로 처리  
a = (b = (c = 42))

```javascript
var a = 42;
var b = "foo";
var c = false;

var d = a && b || c ? c || b ? a : c && b : a;
console.log(d);
```
((a && b) || c) ? ((c || b) ? a : (c && b)) : a  
- (a && b)는 "foo"
- "foo" || c는 "foo"
- 첫 번째 삼항 연산: "foo"는 true? -> o
- (c || b)는 "foo"
- 두 번째 삼항 연산: "foo"는 true -> o
- a는 42

### 5.2.4 결론
규칙에 따라 코딩 vs 명시적 코딩  
연산자 우선순위/결합성과 ( )의 사용을 적절히 배합  
연산자 우선순위를 통해 코드 가독성을 높이고, 혼동을 최소화하기 위해 ( )를 적절히 사용

## 5.3 세미콜론 자동 삽입
ASI(Automatic Semicolon Insertion): 자동 세미콜론 삽입  
세미콜론이 누락된 곳에 엔진이 자동으로 ;을 삽입  
ASI는 새 줄(행 바꿈)에만 적용되며, 어떠한 경우에도 줄 중간에 삽입되는 일은 없음  
자바스크립트 파서는 기본적으로 줄 단위로 파싱, ;이 빠져서 에러가 나면 ;을 넣어보고 타당한 것 같으면 ;를 삽입함
```javascript
var a = 42, b
c;
```
```javascript
var a = 42, b = "foo";
a
b
```
```javascript
var a = 42;
do {
  // ...
} while (a)
a;
```
문 블록(while, for 등)에서는 ;이 필수가 아니기 때문에 ASI 역시 필요 없음  

break, continue, return, yield 키워드에서의 ASI
```javascript
function foo(a) {
  if (!a) return
  a *= 2;
  // ...
}
```
ASI는 return문 끝에 ;을 추론하여 삽입  
```javascript
// return() 의 경우
function foo(a) {
  return (
    a * 2 + 3 / 12
  );
}

// ()를 사용하지 않는 여러 줄의 return
function foo(a) {
  return
    a * 2 + 3 / 12
  ;
}
// return;으로 해석되어 undefined가 반환됨
```

### 5.3.1 에러 정정
ASI 의존에 대한 논쟁  
ASI 찬성 주장: 세미콜론을 반드시 넣어야 하는 경우만 제외하고 생략하여 간결한 코드 작성 지향  
ASI 반대 주장: 개발자가 의도하지 않은 ;의 삽입에 의해 의미가 달라질 수 있고, 그에 의해 바숙련 개발자들의 실수 가능성 증가

## 5.4 에러
자바스크립트는 하위 에러 타입(TypeError, ReferenceError, SyntaxError 등) 뿐만 아니라, 일부 에러는 컴파일 시점에 발생하도록 문법적으로 정의됨  
조기 에러(Early Error)의 조건 존재  
구문상 오류는 아니지만 허용되지 않는 것들도 정의  

정규 표현식의 예
```javascript
var a = /+foo/;
```
구문상 문제가 없지만 올바르지 않은 정규 표현식은 조기 에러를 던짐  

할당 대상은 반드시 식별자여야 함
```javascript
var a;
42 = a;
```

엄격 모드에서의 조기 에러  
함수 인자명의 중복
```javascript
function foo(a, b, a) { } // 정상 실행
function bar(a, b, a) { "use strict"; } // 에러
```
동일한 이름의 프로퍼티가 여러 개 있는 객체 리터럴
```javascript
(function() {
  "use strict";

  var a = {
    b: 42,
    b: 43
  }; // 에러
})
```

### 5.4.1 너무 이른 변수 사용
ES6의 TDZ(Temporal Dead Zone): 아직 초기화를 하지 않아 변수를 참조할 수 없는 코드 영역  
let 블록 스코핑이 대표적인 예
```javascript
{
  a = 2; // ReferenceError
  let a
}
```
let a 선언에 의해 초기화 되기 전 a = 2 할당문이 변수 a에 접근 시도  
그러나 a는 TDZ 내부에 있으므로 에러 발생  

typeof 연산자는 선언되지 않은 변수 앞에 붙여도 오류가 발생하지 않음  
그러나 TDZ 참조 시에는 에러가 발생함
```javascript
{
  typeof a; // undefined
  typeof b; // ReferenceError
  let b;
}
```

## 5.5 함수 인자
TDZ 관련 에러 - ES6 디폴트 인자 값
```javascript
var b = 3;
function foo(a = 42, b = a + b + 5) {
  // ...
}
```
두 번째 할당문에서 아직 TDZ에 남아 있는 b를 참조하려 하기 때문에 에러 발생  

ES6 디폴트 인자 값은 인자를 넘기지 않거나 undefined를 전달했을 때 적용
```javascript
function foo(a = 42, b = a + 1) {
  console.log(a, b);
}
foo();
foo(undefined);
foo(5);
foo(void 0, 7);
foo(null); // null은 a + 1 표현식에서 0으로 강제변환됨
```
인자 값이 없는 것과 undefined 값을 받을 때의 차이점
```javascript
function foo(a = 42, b = a + 1) {
  console.log(arguments.length, a, b, arguments[0], arguments[1]);
}
foo();
foo(10);
foo(10, undefined);
foo(10, null);
```
인자를 넘기지 않았을 경우 디폴트 인자 값이 적용되었지만 arguments 배열에는 원소가 없음  
undefined 인자를 명시적으로 넘길 경우 arguments 배열에도 값이 undefined인 원소가 추가됨  
디폴트 인자 값이 arguments 배열 슬롯과 이에 대응하는 인자 값 간 불일치를 초래
ES5에서의 경우 - 동일한 불일치 발생
```javascript
function foo(a) {
  a = 42;
  console.log(arguments[0]);
}
foo(2);
foo();
```
인자를 넘기면 arguments의 슬롯과 인자가 연결, 항상 같은 값이 할당됨  
인자 없이 호출하면 연결되지 않음  
엄격 모드에서는 절대 연결되지 않음
```javascript
function foo(a) {
  "use strict";
  a = 42;
  console.log(arguments[0]);
}
foo(2);
foo();
```
확실하지 않은 연결에 의존하여 코딩하는 것은 바람직하지 않음  
잘 설계된 기능이 아닌 '구멍 난 추상화'  
auguments 배열은 비 권장 요소 - ES6부터는 rest 인자(...) 권장  
그러나 ES6 이전까지 유용했던 기능  
인자와 그 인자에 해당하는 arguments 슬롯을 동시에 참조하지 말 것 - 이 규칙만 준수한다면 arguments 배열과 인자를 혼용하는 것은 안전

## 5.6 try...finally
try 문에서 catch, finally 중 하나는 필수  
finally절은 다른 블록 코드에 상관없이 필히 실행되어야 할 콜백함수와 같음  
try 절에 return 문이 있는 경우
```javascript
function foo() {
  try {
    return 42;
  } finally {
    console.log("Hello");
  }
  console.log("no exec");
}
console.log(foo());
```
foo() 함수의 완료 값은 42로 세팅되고, try 절의 실행이 종료되면서 바로 finally 절로 넘어감  
그 후 foo() 함수 전체 실행 종료 후 완료 값은 호출부 console.log()문에 반환
try 안에 throw가 있는 경우
```javascript
function foo() {
  try {
    throw 42;
  } finally {
    console.log("Hello");
  }
  console.log("no exec");
}
console.log(foo());
```
finally 절에서 예외가 발생되면 이전의 실행 결과는 모두 무시됨. 즉, 이전 try 블록에서 생성한 완료 값은 모두 사장됨
```javascript
function foo() {
  try {
    return 42;
  } finally {
    throw "throw"
  }
  console.log("no exec");
}
console.log(foo());
```
비선형 제어문(continue, break): return, throw와 유사하게 작동
```javascript
for (var i = 0; i < 10; i++) {
  try {
    continue;
  } finally {
    console.log(i);
  }
}
```
continue문에 의해 console.log() 문은 루프 순회 끝 부분에서 실행됨  
i++로 인해 인덱스가 수정되지 직전까지 실행됨  

finally절의 return문 - 이전에 실행된 try나 catch 절의 return을 덮어쓰는 기능  
단 반드시 명시적으로 return문을 사용해야 함
```javascript
function foo() {
  try {
    return 42;
  } finally {
    // return 없음 -> 이전 return 실행
  }
}

function bar() {
  try {
    return 42;
  } finally {
    // return 42 무시
    return;
  }
}

function baz() {
  try {
    return 42;
  } finally {
    // return 42 무시
    return "Hello";
  }
}

console.log(foo());
console.log(bar());
console.log(baz());
```
일반적인 함수에서는 return을 생략해도 return; 또는 return undefined;를 한 것으로 치지만, finally 안에서 return을 빼면 이전의 return을 무시하지 않고 실행함  

레이블 break와 finally
```javascript
function foo() {
  bar: {
    try {
      return 42;
    } finally {
      // 'bar' 레이블 블록으로 나감
      break bar;
    }
  }
  console.log("abc");
  return "Hello";
}
console.log(foo());
```
finally + 레이블 break 코드: 사실상 return의 취소 - 권장되지 않는 방식

## 5.7 switch
```javascript
switch (a) {
  case 2:
    // ...
    break;
  case 42:
    // ...
    break;
  default:
    //...
}
```
switch 표현식과 case 표현식 간의 매치 과정은 === 알고리즘과 동일  

강제 변환이 일어나는 동등 비교(==) 적용
```javascript
var a = "42";
switch (true) {
  case a == 10:
    console.log("10 또는 '10'");
    break;
  case a == 42:
    console.log("42 또는 '42'");
    break;
  default:
    // ...
}
```
==를 사용해도 switch문은 엄격하게 매치함  
case 표현식 평가 결과가 truthy지만 엄격히 true는 아닐 경우 매치는 실패  
&&나 || 등의 논리 연산자 사용 시 문제
```javascript
var a = "Hello world";
var b = 10;

switch (true) {
  case (a || b == 10):
    // ...
    break;
  default:
    console.log("abc");
}
```
(a || b == 10)의 평가 결과는 true가 아닌 "Hello world" - 매치되지 않음  
이 경우 분명한 true/false로 떨어지게 case !!(a || b == 10): 와 같이 작성해야 함  

default절 - 선택 사항. 그러나 default절에서도 break를 쓰지 않으면 그 후의 코드가 계속 실행됨
```javascript
var a = 10;

switch (a) {
  case 1:
  case 2:
  default:
    console.log("default");
  case 3:
    console.log("3");
  break;
  case 4:
    console.log("4");
}
// case절에서도 레이블 break 사용 가능
```
매치되는 것이 없기 때문에 default를 실행, break가 없으므로 이미 한 번 지나친 case 3: 블록을 다시 실행함

# 1 스코프란 무엇인가
특정 장소에 변수를 저장하고 이후 그 변수를 찾는 것과 관련된 규칙

## 1.1 컴파일러 이론
자바스크립트는 컴파일러 언어  
컴파일레이션: 전통적 컴파일러 언어 처리 과정에서 프로그램을 이루는 소스 코드가 실행되기 전 거치는 3단계
### tokenizing / lexing
문자열을 나누어 '토큰'이라는 의미있는 조각으로 만드는 과정  
var a = 2;의 토큰
var, a, =, 2, ;
빈 칸의 경우 의미가 있는지에 따라 토큰이 될 수도 있음
### parsing
토큰 배열을 프로그램 문법 구조를 반영하여 중첩 원소를 갖는 트리 형태로 바꾸는 과정  
AST(Abstract Syntax Tree, 추상 구문 트리): 파싱 결과로 만들어진 트리  
var a = 2의 트리 - 변수 선언이라는 최상위 노드에서 시작, 'a'의 값을 가지는 확인자와 대입 수식이라는 자식 노드를 지님. 대입 수식 노드는 '2'라는 값을 지닌 숫자 리터럴을 자식 노드로 지님
### 코드 생성
AST를 컴퓨터에서 실행 코드로 바꾸는 과정  

자바스크립트 엔진은 세 가지 단계뿐 아니라 많은 부분에서 다른 프로그래밍 언어의 컴파일러보다 복잡  
자바스크립트 엔진은 자바스크립트 컴파일레이션을 미리 수행하지 않아서 최적화할 시간이 많지 않음

## 1.2 스코프 이해
### 1.2.1 처리 주체
프로그램을 처리하는 주체
- 엔진: 컴파일레이션의 시작부터 끝까지 전 과정과 자바스크립트 프로그램 실행을 책임
- 컴파일러: 파싱과 코드 생성 담당
- 스코프: 선언된 모든 확인자(변수) 검색 목록을 작성하고 유지. 또한 엄격한 규칙을 강제하여 현재 실행 코드에서 확인자의 적용 방식을 정함

### 1.2.2 앞과 뒤
프로그램 'var a = 2;' - 일반적으로 하나의 구문으로 여김  
엔진은 두 개의 서로 다른 구문으로 봄 - 컴파일러가 컴파일레이션 과정에서 처리할 구문, 실행 과정에서 엔진이 처리할 구문  
컴파일러 - 렉싱을 통해 구문을 토큰으로 쪼갬. 그 후 토큰을 파싱하여 트리 구조 생성  

"변수를 위해 메모리를 할당하고 할당된 메모리를 a라 명명한 후 그 변수에 2를 넣는다"  
컴파일러는 위와 같은 예상과는 다른 방식으로 일을 처리  
1. 컴파일러가 'var a'를 만나면 스코프에게 변수 a가 특정한 스코프 컬렉션 안에 있는지 물음. 변수 a가 이미 있다면 컴파일러는 선언을 무시하고 지나가고, 그렇지 않으면 컴파일러는 새로운 변수 a를 스코프 컬렉션 내에 선언하라고 요청함
2. 그 후 컴파일러는 'a = 2' 대입문 처리를 위해 나중에 엔진이 실행할 수 있는 코드를 생성. 엔진이 실행하는 코드는 먼저 스코프에게 a라 부르는 변수가 현재 스코프 컬렉션 내에서 접근할 수 있는지 확인. 가능하다면 엔진은 변수 a를 사용, 아니라면 엔진은 다른 곳을 탐색  

별개의 두 가지 동작을 통해 변수 대입문을 처리  
- 컴파일러가 변수를 선언(현재 스코프에 미리 변수가 선언되지 않은 경우)
- 엔진이 스코프에서 변수를 찾고 변수가 있다면 값을 대임

### 1.2.3 컴파일러체
컴파일러가 생성한 코드를 실행할 때 엔진은 변수 a가 선언된 적이 있는지 스코프에서 검색  
어떤 종류의 검색을 하느냐에 따라 검색 결과가 달라짐  
위의 예시에서는 엔진은 변수 a를 찾기 위해 LHS 검색을 수행(다른 종류의 검색은 RHS)  
LHS와 RHS는 대입 연산 방향의 차이  
LHS 검색: 변수가 대입 연산자의 왼쪽에 있을 때 수행  
RHS 검색: 변수가 대입 연산자의 오른쪽에 있을 때 수행  
RHS 검색은 단순히 특정 변수의 값을 찾는 것과 동일. LHS 검색은 값을 넣어야 하므로 변수 컨테이너 자체를 탐색  
RHS는 그 자체로 '대입문의 오른쪽'이 아니라 '왼편이 아닌 쪽'에 가까움
```javascript
console.log(a);
```
a에 대한 참조는 RHS 참조 - 구문에서 a에 아무것도 대입하지 않기 때문  

```javascript
a = 2;
```
a에 대한 참조는 LHS 참조. 현재의 a 값을 신경쓸 필요 없이 '= 2' 대입 연산 수행 대상 변수를 찾기 때문

LHS와 RHS 참조를 모두 수행하는 경우
```javascript
function foo(a) {
  console.log(a);
}
foo(2);
```
함수 호출 시 RHS 참조 사용  
인수로 값 2를 함수 foo()에 넘겨줄 때 값 2를 인자 a에 대입하는 연산 발생  
인자 a에 대한 대입 연산을 위해 LHS 검색이 수행됨  
변수 a에 대한 RHS 참조 역시 수행 - 결과값이 console.log() 함수에 전달, console.log()가 실행되기 위해 참조가 필요  
-> console 객체를 RHS 검색하여 log 메서드가 있는지 확인  
구현된 log() 내부 인자 존재 -> 첫 번째 인자를 LHS 검색으로 찾아 2를 대입

### 1.2.4 엔진과 스코프의 대화
```javascript
function foo(a) {
  console.log(a);
}
foo(2);
```
p.199 엔진과 스코프의 대화 해석  
엔진: foo에 대한 RHS 참조를 위해 스코프에 foo 탐색 요청  
스코프: 컴파일러 선언 내역을 확인하고 foo 탐색, 엔진에 전달  
엔진: foo 실행  
엔진: a에 대한 LMS 참조를 위한 a 탐색 요청  
스코프: 컴파일러 선언 내역을 확인하고 a를 탐색, 엔진에 전달  
엔진: a에 2를 대입  
엔진: console에 대한 RHS 참조를 위해 스코프에 console 탐색 요청  
스코프: 내장 객체 목록 중에서 console 탐색. 엔진에 전달  
엔진: log()에 대한 탐색 요청  
스코프: log() 탐색 및 엔진에 전달  
엔진: a의 값을 확인하고 log()에 인자로 넘김  

### 1.2.5 퀴즈
```javascript
function foo(a) {
  var b = a;
  return a + b;
}
var c = foo(2);
```
1. 모든 LHS 검색을 찾아보라
2. 모든 RHS 검색을 찾아보라

## 1.3 중첩 스코프
여러 개의 스코프를 고려해야 하는 상황  
엔진은 대상 변수를 현재 스코프에서 발견하지 못하면 다음 바깥 스코프로 넘어가거나 글로벌 스코프에서 변수를 탐색
```javascript
function foo(a) {
  console.log(a + b);
}
var b = 2;
foo(2);
```
b에 대한 RHS 참조는 foo 함수 안에서 처리 불가 -> 함수를 포함하는 스코프에서 처리  
중첩 스코프 탐사의 규칙
- 엔진은 현재 스코프에서 변수를 찾기 시작하고, 찾지 못하면 한 단계씩 올라감
- 최상위 글로벌 스코프에 도달하면 변수를 찾았든, 못 찾았든 검색을 중단

## 1.4 오류
LHS와 RHS 검색 방식은 변수가 아직 선언되지 않았을 때 서로 다르게 동작
```javascript
function foo(a) {
  console.log(a + b);
  b = a;
}
foo(2);
```
b에 대한 첫 RHS 검색 실패 시 다시 b를 찾을 수 없음 - 스코프에서 찾지 못한 변수는 '선언되지 않은 변수'  
RHS 검색이 중첩 스코프 내 어디에서도 변수를 찾지 못하면 엔진은 'ReferenceError' 발생  

LHS 검색을 수행하여 변수를 찾지 못하고 글로벌 스코프에 도달할 때 프로그램이 'Strict Mode'로 동작하고 있는 것이 아니라면, 글로벌 스코프는 엔진이 검색하는 이름을 가진 새로운 변수를 생성하여 엔진에 전달  

Strict Mode에서는 글로벌 변수를 자동 또는 암시적으로 생성 불가 - LHS 검색 시에도 RHS와 마찬가지로 ReferenceError를 발생시킴  

RHS 검색 결과 변수는 찾았지만 그 값을 통해 불가능한 일을 하려고 할 경우 - 함수가 아닌 값을 함수처럼 실행하거나 null이나 undefined 값을 참조  
-> 엔진은 TypeError를 발생시킴  
=> ReferenceError는 스코프에서 대상을 찾았는지와 관계, TypeError는 스코프 검색은 성공했으나 결과값을 통해 적합하지 않거나 불가능한 시도를 한 경우를 의미