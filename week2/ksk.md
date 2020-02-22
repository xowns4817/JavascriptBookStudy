# 3 네이티브

네이티브: 특정 환경에 종속되지 않은, ECMAScript 명세의 내장 객체  
가장 많이 쓰이는 네이티브  
내장 함수
- String()
- Number
- Boolean()
- Array()
- Object()
- Function()
- RegExp()
- Date()
- Error()
- Symbol() - ES6에서 추가됨

```javascript
var s = new String("Hello World");
console.log(s.toString());
```
생성자처럼 사용할 수 있으나 객체 래퍼가 리턴됨
```javascript
var a = new String("abc");
console.log(typeof a);
console.log(a instanceof String);
console.log(Object.prototype.toString.call(a));
```

객체 래퍼의 형태는 브라우저마다 다르게 생김
```javascript
var a = new String("abc");
console.log(a);
```
결론: new String("abc")은 "abc"를 감싸는 문자열 래퍼를 생성, 원시값 "abc"는 아님
```javascript
var a1 = new String("abc");
var a2 = new String("abc");
var b1 = "abc";
var b2 = "abc";
console.log(a1 === a2);
console.log(b1 === b2);
```

## 3.1 내부 [[Class]]
typeof가 'object'인 값에는 Class라는 내부 프로퍼티가 추가로 붙음  
직접 접근할 수 없고 Object.prototype.toString() 메서드에 값을 넣어 호출  
```javascript
var r1 = Object.prototype.toString.call([1, 2, 3]);
console.log(r1);
var r2 = Object.prototype.toString.call(/regex-literal/i);
console.log(r2);
```
대부분 내부 Class는 해당 값과 관련된 내장 네이티브 생성자를 가리키지만 그렇지 않을 때도 있음  

원시 값의 내부 Class  
null, undefined: Null(), Undefined()같은 네이티브 생성자는 없으나 내부 Class 값이 존재
```javascript
var n = Object.prototype.toString.call(null);
console.log(n);
var u = Object.prototype.toString.call(undefined);
console.log(u);
```

그 밖의 문자열, 숫자, 불리언 등의 단순 원시 값은 '박싱'과정을 거침
```javascript
var s = Object.prototype.toString.call("abc");
console.log(s);
var n = Object.prototype.toString.call(42);
console.log(n);
var b = Object.prototype.toString.call(true);
console.log(b);
```
내부 Class 값이 각각 String, Number, Boolean으로 표시  
=> 단순 원시 값은 해당 객체 래퍼로 자동 박싱됨

## 3.2 래퍼 박싱하기
원시 값에는 프로퍼티나 메서드가 없으므로 .length, .toString()으로 접근하기 위해 원시 값을 객체 래퍼로 감싸야 함  
자바스크립트는 원시 값을 자동 박싱(래핑)함
```javascript
var a = "abc";
a.length;
a.toUpperCase();
```
원시 값의 프로퍼티/메서드를 빈번하게 사용하면서 직접 객체 형태로 쓰지 않고 암시적 객체 생성이 작동되는 이유  
만약 개발자가 직접 객체 형태로 '선 최적화'한다면 프로그램 성능이 저하될 수 있음  

### 3.2.1 객체 래퍼의 함정
객체 래퍼 사용 시 유의점  
Boolean의 예
```javascript
var a = new Boolean(false);
if(!a) {
  console.log("Oops"); // 실행x
}
```
false를 객체 래퍼로 감싸면 'truthy'  
다음의 결과는 true가 출력됨
```javascript
var a = new Boolean(false);
console.log(Boolean(a));
```
수동으로 원시 값 박싱하기: Object() 함수 사용  
```javascript
var a = "abc";
var b = new String(a);
var c = Object(a);

console.log(a); // "string" 
console.log(b); // "object"
console.log(c); // "objcec"

console.log(b instanceof String);
console.log(c instanceof String);

var b1 = Object.prototype.toString.call(b);
var c1 = Object.prototype.toString.call(c);
console.log(b1);
console.log(c1);
```
객체 래퍼로 직접 박싱하는 것은 필요한 경우가 간혹 있으나 권장되지 않음

## 3.3 언박싱
valueOf()를 통해 객체 래퍼의 원시 값 추출
```javascript
var a = new String("abc");
var b = new Number(42);
var c = new Boolean(true);
console.log(a.valueOf(), b.valueOf(), c.valueOf());
```
암시적 언박싱  
b에는 언박싱된 원시 값 "abc"가 대입됨
```javascript
var a = new String("abc");
var b = a + "";
console.log(typeof a, typeof b);
```

## 3.4 네이티브 - 생성자
배열, 객체, 함수, 정규식 값은 일반적으로 리터럴 형태로 생성  
리터럴은 생성자 형식으로 만든 것과 동일한 종류의 객체를 생성함 - 즉, 래핑되지 않은 값은 없음  
확실히 필요한 상황이 아니라면 생성자 사용은 가급적 사용을 자제

### 3.4.1 Array()
```javascript
var a = new Array(1, 2, 3);
var b = [1, 2, 3];
console.log(a);
console.log(b);
```
Array 생성자: 배열의 크기를 미리 정하는 기능  
인자로 하나의 숫자를 받으면 원소가 하나인 배열을 생성하지 않고, 숫자의 크기의 배열을 생성  
```javascript
var a = new Array(3);
console.log(a.length);
```

생성자로 생성한 배열, undefined로 구성된 배열, length를 통해 빈 슬롯으로 구성한 배열 비교
```javascript
var a = new Array(3);
var b = [ undefined, undefined, undefined ];
var c = [];
c.length = 3;
console.log(a); // [ <3 empty items> ] (크롬: [empty × 3])
console.log(b); // [ undefined, undefined, undefined ]
console.log(c); // [ <3 empty items> ] (크롬: [empty × 3])
```
파이어폭스에서 실행 시 a, c는 [ , , , ]  

a와 b는 실제로 다른 형태
```javascript
var a = new Array(3);
var b = [ undefined, undefined, undefined ];
a.join("-");
b.join("-");
console.log(a);
console.log(b);

var a1 = a.map(function(v, i){ return i; });
var b1 = b.map(function(v, i){ return i; });
console.log(a1);
console.log(b1);
```
a는 슬롯이 없기 때문에 map() 함수가 순회할 원소가 없음  
join()은 슬롯이 있다는 가정하에 length만큼 루프를 반복함  
-> map 함수는 이러한 가정을 하지 않기 때문에 빈 슬롯 배열이 입력되면 출력에 실패함

undefined 값이 원소로 채워진 배열 생성하기
```javascript
var a = Array.apply(null, { length: 3 });
console.log(a);
```
apply(): 모든 함수에서 사용 가능한 유틸리티  
첫 번째 인자 this: 객체 바인딩  
두 번째 인자: 인자의 배열 또는 유사배열. 원소들이 펼쳐져서 함수의 인자로 전달됨  
=> Array.apply()는 Array() 함수를 호출함과 동시에 { length: 3 } 객체 값을 펼쳐 인자로 투입  
apply() 내부에서는 0에서 length 직전까지 루프를 순회, 슬롯의 값이 존재하지 않기 때문에 모두 undefined를 반환

### 3.4.2 Object(), Function(), and RegExp()
Object(), Function(), RegExp() 생성자 사용도 선택사항(권장되지 않음)
```javascript
var c = new Object();
c.foo = "bar";
console.log(c);

var d = { foo: "bar" };
console.log(d);

var e = new Function("a", "return a * 2;");
var f = functiona(a) { return a * 2 };
function g(a) { return a * 2; };
console.log(e(2));
console.log(f(2));
console.log(g(2));

var h = new RegExp("^a*b+", "g");
var i = /^a*b+/g;
console.log(h);
console.log(i);
```
new Object()와 같은 생성자 폼은 사용할 일이 거의 없음  
Function 생성자는 함수의 인자나 내용을 동적으로 정의해야 하는 경우에 한해 유용 - 매우 제한적인 상황  
정규 표현식은 리터럴 형식으로 정의하는 것이 권장됨. 구문이 쉬우며, 성능상 이점  
=> 자바스크립트 엔진이 실행 전 정규 표현식을 미리 컴파일한 후 캐시  
정규표현식 생성자는 패턴을 동적으로 정의할 경우 유용
```javascript
var name = "Kyle";
var namePattern = new RegExp("\\b(?:" + name + ")+\\b", "ig");
var matches = "Kyle asdfg".match(namePattern);
console.log(matches);
```
new RegExp("패턴", "플래그") 형식으로 사용

### 3.4.3 Date(), Error()
리터럴 형식이 없으므로 다른 네이티브에 비해 유용  

date 객체  
new Date()로 생성  
날짜와 시각을 인자로 받음  
인자 생략 시 현재 날짜 / 시각  
유닉스 타임스탬프 값(1970년 1월 1일부터 현재까지 흐른 시간을 초 단위로 환산)을 얻는 용도 - getTime()  
Date.now()

Error() 생성자  
앞에 new 유무 상관없이 결과는 동일  
실행 스택 콘텍스트를 포착하여 객체(자바스크립트 엔진 대부분이 읽기 전용 프로퍼티인 .stack으로 접근 가능)에 담는 용도  
이 실행 콘텍스트는 함수 호출 스택, error 객체가 만들어진 줄 번호 등 디버깅에 도움이 될 만한 정보를 포함  
일반적으로 throw 연산자와 함께 사용
```javascript
function foo(x) {
  if (!x) {
    throw new Error("no x!");
  }
}
var x = false;
foo(x);
```
Error 객체 인스턴스에는 message 프로퍼티와 type 등 읽기 전용 프로퍼티가 포함  
그러나 읽기 편한 포멧으로 에러 메시지를 확인하려면 stack 프로퍼티 대신 error 객체의 toString() 사용

### 3.4.4 Symbol()
Symbol: ES6에서 추가된 새로운 원시 값 타입  
충돌 염려 없이 객체 프로퍼티로 사용 가능한 특별한 '유일 값'  
주로 ES6의 특수한 내장 로직에 쓰기 위해 고안됨  
Symbol.create, Symbol.iterator 와 같이 Symbol 함수 객체의 정적 프로퍼티로 접근  
심벌은 객체가 아니고 단순한 스칼라 원시 값임  
사용법
```javascript
obj[Symbol.iterator] = function(){/**/}
```
직접 정의하기 위해 Symbol() 네이티브를 사용  
new를 붙이면 에러가 나는 유일한 네이티브 생성자
```javascript
var mysym = Symbol("my own symbol");
console.log(mysym);
console.log(mysym.toString());
console.log(typeof mysym);

var a = {};
a[mysym] = "foobar";
var o = Object.getOwnPropertySymbols(a);
console.log(o);
```
private(전용) 프로퍼티는 아니지만 사용 목적에 맞게 대부분 전용 또는 특별한 프로퍼티로 사용  
추후 언더스코어(_, 전용/특수/내부 프로퍼티임을 표기하기 위해 사용됨)를 대체할 가능성

### 3.4.5 네이티브 프로토타입
내장 네이티브 생성자는 각자의 .prototype 객체를 보유  
prototype 객체에는 해당 객체의 하위 타입별로 고유한 로직이 포함  

String 객체의 예
- indexOf(): 문자열에서 특정 문자의 위치를 검색
- charAt(): 문자열에서 특정 위치의 문자를 반환
- substr(), subString(), slice(): 문자열의 일부를 새로운 문자열로 추출
- toUpperCase() / toLowerCase(): 대문자 / 소문자로 변환된 새로운 문자열 생성
- trim(): 앞/뒤 공란이 제거된 새로운 문자열 생성
prototype delegation에 의해 모든 문자열이 위 메서드를 같이 쓸 수 있음
```javascript
var a = " abc ";
console.log(a.indexOf("c"));
console.log(a.toUpperCase());
console.log(a.trim());
```

```javascript
var a = typeof Function.prototype;
console.log(a);
console.log(Function.prototype());

var b = RegExp.prototype.toString(); // 빈 regex
console.log(b);
var b1 = "abc".match(RegExp.prototype);
console.log(b1);
```

네이티브 프로토타입 변경 - 권장되지 않음
```javascript
Array.isArray(Array.prototype); // true
Array.prototype.push(1, 2, 3);
console.log(Array.prototype);

Array.prototype.length = 0;
```

Function.prototype - 함수
RegExp.prototype - 정규 표현식
Array.prototype - 배열

#### 프로토타입은 디폴트
변수에 적절한 타입의 값이 할당되지 않은 상태에서는
- Function.prototype - 빈 함수
- RegExp.prototype - 빈 정규 표현식(아무것도 매칭하지 않음)
- Array.prototype - 빈 배열
```javascript
function isThisCool(vals, fn, rx) {
  vals = vals || Array.prototype;
  fn = fn || Function.prototype;
  rx = rx || RegExp.prototype;

  return rx.test(vals.map(fn).join(""));
}
// var a = isThisCool(); // 실행 안됨
// console.log(a);

// var b = isThisCool(["a", "b", "c"], function(v){ return v.toUpperCase(); }, /C/);
var b = isThisCool(["a", "b", "c"], function(v){ return v.toUpperCase(); }, /D/);
console.log(b);
```


# 4 강제변환
## 4.1 값 변환
어떤 값을 다른 타입의 값으로 바꾸는 과정이 명시적이면 'type casting', 암시적이면 'coercion(강제변환)'  
박싱은 강제 변환이 아님  
강제변환을 하면 문자열, 숫자, 불리언 등의 원시값 중 하나가 됨  
명시적 강제변환 - 의도적으로 타입변환을 발생시킴  
암시적 강제변환 - 불분명한 부수 효과로부터 발생하는 타입변환
```javascript
var a = 42;
var b = a + ""; // 암시적 강제변환
var c = String(a); // 명시적 강제변환
console.log(a, b, c);
```
공백 문자열과의 +연산은 문자열 접합 처리를 의미, 부수효과로서 숫자를 문자열로 강제변환함  
String() 함수는 값을 인자로 받아 명백하게 문자열 타입으로 강제변환함  

## 4.2 추상 연산
### 4.2.1 ToString
문자열이 아닌 값을 문자열로 변환하는 작업  
내장 원시 값은 본연의 문자열화 방법이 정해져 있음(null -> 'null', undefined -> 'undefined')  
숫자는 너무 작거나 큰 값은 지수 형태로 변경됨
```javascript
var a = 1.07 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
console.log(a.toString());
```
일반 객체는 특별히 지정하지 않으면 기본적으로 (Object.prototype.toString()) toString() 메서드가 내부 Class를 반환  
배열의 toString(): 모든 원소 값이 분리된 형태로 반환됨
```javascript
var a = [1, 2, 3];
console.log(a.toString());
```

#### JSON 문자열화
ToString은 JSON.stringify()를 통한 JSON 문자열화와 관련  
JSON 문자열화와 toString() 변환은 기본적으로 같은 로직
```javascript
var a = JSON.stringify(42);
var b = JSON.stringify("42");
var c = JSON.stringify(null);
var d = JSON.stringify(true);
console.log(a, b, c, d);
```

JSON 표현형으로 확실히 나타낼 수 있는 값(JSON-safe value)은 모두 JSON.stringify()로 문자열화 가능  
표준 JSON 규격을 벗어난(다른 언어로 이식하여 JSON 값으로 쓸 수 없는) 값은 불가  
인자가 undefined, 함수, 심벌 값이면 자동으로 누락시키며, 배열에 포함되어 있으면 null로 변환시킴
```javascript
var a = JSON.stringify(undefined);
var b = JSON.stringify(function(){});
var c = JSON.stringify([1, undefined, function(){}, 4]);
var d = JSON.stringify({ a: 2, b: function(){} });
console.log(a, b, c, d);
```

JSON.stringify()에 circular reference 객체를 넘기면 에러 발생  
객체 자체에 toJSON() 메서드가 정의되어 있다면 먼저 이 메서드를 호출하여 직렬화한 값을 반환  

부적절한 JSON값이나 직렬화할 수 없는 값을 문자열하려면 toJSON() 메서드를 따로 정의해야 함
```javascript
var = o = {};
var a = {
  b: 42,
  c: o,
  d: function(){}
}

// 'a' circular reference
o.e = a;
// JSON.stringify(a); // error

// JSON값으로 직렬화하는 함수를 따로 정의
a.toJSON = function() {
  // b만 포함
  return { b: this.b }
}
console.log(JSON.stringify(a));
```

toJSON()은 문자열을 문자열화할 의도가 아니라면 정확하지 않을 가능성이 높음  
문자열화하기 적당한 JSON 안전 값으로 바꾸는 역할. JSON 문자열로 바꾸는 것이 아님
```javascript
var a = {
  val: [1, 2, 3],
  toJSON: function() {
    return this.val.slice(1);
  }
};

var b = {
  val: [1, 2, 3],
  toJSON: function() {
    return "[" + this.val.slice(1).join() + "]";
  }
};

var a1 = JSON.stringify(a);
var b1 = JSON.stringify(b);
console.log(a1, typeof a1);
console.log(b1, typeof a1);
```

배열 또는 함수 형태의 대체자를 JSON.stringify()의 두 번째 선택 인자로 지정하여 객체를 재귀적으로 직렬화하면서 필터링  
대체자가 배열이면 전체 원소는 문자열이여야 하고 각 원소는 객체 직렬화의 대상 프로퍼티명  
즉 포함되지 않은 프로퍼티는 직렬화 과정에서 빠김  
대체자가 함수면 처음 한 번은 객체 자신에 대해, 그 다음은 각 객체 프로퍼티별로 한 번씩 실행하면서 매번 키와 값 인자를 전달  
직렬화 과정에서 해당 키를 건너뛰려면 undefined를, 그 외엔 해당 값을 반환
```javascript
var a = {
  b: 42,
  c: "42",
  d: [1, 2, 3]
};
var j1 = JSON.stringify(a, ["b", "c"]);
var j2 = JSON.stringify(a, function(k, v) {
  if (k !== "c") return v;
});
console.log(j1);
console.log(j2);
```

JSON.stringify()의 세 번째 선택인자: 스페이스. 읽기 쉽도록 들여쓰기  
들여쓰기를 할 빈 공간의 개수를 숫자로 지정하거나 문자열을 지정하여 각 들여쓰기 수준에 사용  
- 문자열: 10자 이상이면 앞에서 10자까지만 잘라 사용
```javascript
var a = {
  b: 42,
  c: "42",
  d: [1, 2, 3]
}
var a1 = JSON.stringify(a, null, 3);
console.log(a1);
var a2 = JSON.stringify(a, null, "-----");
console.log(a2);
```

JSON.stringify()는 직접적인 강제변환 형식은 아니나 다음의 이유로 ToString 강제 변환과 연관
- 문자열, 숫자, 불리언, null 값이 JSON으로 문자열화하는 방식은 ToString 추상 연산 규칙에 따라 문자열 값으로 강제변환되는 방식과 동일
- JSON.stringify()에 전달한 객체가 자체 toJSON() 메서드를 갖고 있다면, 문자열화 전 toJSON()이 자동으로 호출되어 JSON 안전 값으로 '강제변환'됨

### 4.2.2 ToNumber
true -> 1, false -> 0  
undefined -> NaN  
null -> 0  
문자열 -> 숫자 리터럴. 변환 실패 시 NaN  
0이 앞에 붙은 8진수는 8진수로 처리하지 않고 일반 10진수로 처리함  
객체: 동등한 원시 값으로 변환 후 그 결과값을 변환함
```javascript
var a = {
  valueOf: function() {
    return "42";
  }
};
var b = {
  toString: function() {
    return "42";
  }
}
var c = [4, 2];
c.toString = function() {
  return this.join("");
}
var a1 = Number(a);
var b1 = Number(b);
var c1 = Number(c);
var d = Number("");
var e = Number([]);
var f = Number(["abc"]);
console.log(a1, b1, c1, d, e, f);
```
valueOf()를 쓸 수 있고 반환 값이 원시 값이면 그대로 강제변한하되, 그렇지 않을 경우 toString()을 이용하여 강제변환  
원시값으로 바꿀 수 없을 때는 TypeError 오류를 던짐

### 4.2.3 ToBoolean
1과 0이 각각 true, false에 해당하는 다른 언어와 달리 자바스크립트에서는 숫자와 불리언은 서로 별개  

#### falsy
자바스크립트의 모든 값들은 다음 중 하나임
- 불리언으로 강제변환 시 false가 되는 값
- 위 값을 제외한 나머지. true가 되는 값

ES5 명세에 정의된 falsy 값
- undefined
- null
- false
- +0, -0, NaN
- ""

ToBoolean 연산에 대한 인자의 변환 내용
- undefined: false
- Null: false
- Boolean: 인자 값과 동일
- Number: +0. -0, NaN이면 false, 그 외에는 true
- String: 공백 문자열이면 false, 그 외에는 true
- Object: true
```javascript
console.log(Boolean({}));
```

#### falsy 객체
falsy값을 둘러싼 객체 래퍼는 true
```javascript
var a = new Boolean(false);
var b = new Boolean(0);
var c = new Boolean("");
console.log(Boolean(a&&b&&c));
```
falsy 객체는 순수 자바스크립트의 일부는 아니고 브라우저 환경에서 생성되는 객체의 일부  
document.all  
-> 비표준. 비 권장/폐기됨  
-> document.all에 의존하는 레거시 코드가 존재, 현대 표준 코드 베이스에서 혼선 유발
-> 타입 체계를 변경하여 document.all이 falsy로 동작하도록 수정

#### truthy 값
falsy 값 목록에 없는 모든 값들
```javascript
var a = "false";
var b = "0";
var c = "''";
console.log(Boolean(a&&b&&c));
```
```javascript
var a = [];
var b = {};
var c = function(){};
console.log(Boolean(a&&b&&c));
```

## 4.3 명시적 강제변환
분명하고 확실한 타입변환  

### 4.3.1 문자열 <-> 숫자
String()과 Number() 함수 사용  
new 키워드가 붙지 않기 때문에 객체 래퍼를 생성하는 것이 아님
```javascript
var a = 42;
var b = String(a);

var c = "3.14";
var d = Number(c);

console.log(b);
console.log(d);
```

원시값.toString(): 자바스크립트 엔진이 자동으로 값을 객체 래퍼로 박싱함  
+연산: 피연산자를 숫자로 강제변환
```javascript
var a = 42;
var b = a.toString();

var c = "3.14";
var d = +c;

console.log(b);
console.log(d);
```
헷갈리기 쉬우므로 단항 연산자를 다른 연산자와 인접하여 사용하는 것은 권장되지 않음

#### 날짜 -> 숫자
단항연산자 +는 Date 객체를 숫자로 강제변환하는 용도로도 쓰임  
```javascript
var d = new Date("Mon, 18 Aug 2013 08:53:06 CDT");
console.log(d);
console.log(+d); // unix 타임스탬프 표현형
```
현재 시각을 타임스탬프로 바꿈
```javascript
var timestamp = +new Date();
```
강제변환 없이 Date 객체로부터 타임스탬프를 얻어내는 방법(더 명시적이므로 권장됨)
```javascript
var timestamp = new Date().getTime();
console.log(timestamp);

// es5에 추가된 정적 함수 Date.now()
var timestamp2 = Date.now();
console.log(timestamp2);
```
구 버전 브라우저에서 Date.now() 사용하기
```javascript
if (!Date.now) {
  Date.now = function() {
    return +new Date();
  };
}
```
날짜 타입은 강제변환보다는 Date.now() (현재의 타임스탬프), new Date().getTime() (특정 날짜의 타임스탬프) 를 쓰는 게 더 나음

#### 틸드(~)
32비트 숫자로 강제변환 후 NOT 연산(각 비트를 거꾸로 뒤집음)

indexOf(): 단순히 위치를 확인하는 기능보단 어떤 하위 문자열이 다른 문자열에 포함되어 있는지 조사하는 용도로 더 많이 쓰임
```javascript
var a = "Hello World";

// 전부 true
a.indexOf("lo") >= 0;   // found
a.indexOf("lo") != -1;  // found
a.indexOf("ol") < 0;    // not found
a.indexOf("ol") == -1;  // not found
```
indexOf()에 ~를 붙이면 어떤 값을 강제변환하여 불리언 값으로 적절하게 만들 수 있음
```javascript
var a = "Hello World";

~a.indexOf("lo");    // -4 -> true
~a.indexOf("ol");    // 0 -> false
!~a.indexOf("ol");  //  true
```
~은 indexOf()로 검색 결과 실패 시 -1을 0(false값)dmfh, 그 외에는 true 값으로 변경함

### 4.3.2 숫자 형태의 문자열 파싱
```javascript
var a = "42";
var b = "42px";

var a1 = Number(a);
var a2 = parseInt(a);
console.log(a1, a2);

var b1 = Number(b);
var b2 = parseInt(b);
console.log(b1, b2);
```
문자열로부터의 숫자 값 파싱: 비숫자형 문자를 허용  
왼쪽에서 오른쪽 방향으로 파싱하다가 숫자가 아닌 문자를 만나면 파싱이 중단됨
강제변환: 비숫자형 문자를 허용하지 않고 NaN을 반환  
```javascript
var hour = parseInt(08);
var minute = parseInt(09);
console.log(hour, minute);
```

#### 비문자열 파싱
```javascript
console.log(parseInt(1/0, 19));
```
비문자열이 첫 번째 인자로 투입될 경우, 비문자열을 최대한 문자열로 강제변환하려고 시도함 - 예외를 던지지 않음

```javascript
console.log(parseInt(new String("42")));
```

```javascript
var a = {
  num: 21,
  toString: function() { return String(this.num * 2) }
};
console.log(parseInt(a));
```
parseInt()는 인자 값을 강제로 문자열로 바꾼 다음 파싱을 시작하는 로직

parseInt(1/0, 19) => parseInt("Infinity", 19)  
첫 번째 문자 "I"는 19진수 18에 해당, 두 번째 "n"은 0-9 a-i (19진수의) 범위 밖의 문자이므로 파싱은 멈춤

```javascript
var a = parseInt(0.000008);
console.log(a);
// 0.000008 -> 0

var b = parseInt(0.0000008);
console.log(b);
// 8e-7 -> 8

var c = parseInt(false, 16);
console.log(c);
// false -> fa

var d = parseInt(parseInt, 16);
console.log(d);
// function... -> f

var e = parseInt("0x10");
console.log(e);
// 16

var f = parseInt("103", 2);
console.log(f);
// 2
```

### 4.3.3 비 불리언 -> 불리언
Boolean(): 명시적이지만 자주 쓰이지는 않음
```javascript
var a = Boolean("0");
var b = Boolean([]);
var c = Boolean({});
console.log(a, b, c);

var d = Boolean("");
var e = Boolean(0);
var f = Boolean(null);
var _g
var g; = Boolean(_g);
console.log(d, e, f, g);
```

! 부정 단항 연산자는 값을 불리언으로 명시적 강제변환  
그러나 그 과정에서 truthy, falsy까지 바뀌기 때문에 !! 형태로 이중부정 연산자를 사용
```javascript
var a = "0";
var b = [];
var c = {};
console.log(!!a, !!b, !!c);

var d = "";
var e = 0;
var f = null;
var g
console.log(!!d, !!e, !!f, !!g);
```