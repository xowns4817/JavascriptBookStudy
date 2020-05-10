# 6 작동 위임
Prototoype 체계 - 한 객체가 다른 객체를 참조하기 위한 내부 링크. 이러한 링크는 처음 참조하는 객체에 존재하지 않는 프로퍼티/메서드를 참조하려고 할 경우에 활용됨  
엔진은 Prototype 링크를 따라가며 연결된 객체마다 프로퍼티/메서드가 있는지 탐색. 발견되지 않으면 다음 Prototype 링크에 연결된 객체를 타고 이동하며 수색 - 한 무더기의 객체 간 연결고리가 '프로토타입 연쇄'  
자바스크립트의 가장 중요한 핵심 기능이자 실제적인 체계는 '객체를 다른 객체와 연결하는 것'에서 비롯

## 6.1 위임 지향 디자인으로 가는 길
Prototype 사용 방법의 이해를 위해 Prototype이 클래스와는 다른 디자인 패턴이라는 것을 인지해야 함  

### 6.1.1 클래스 이론
클래스 기반 디자인 설계 과정 - 3개의 유사한 태스크(Task, XYZ, ABC)가 있다고 가정  
가장 일반적인 부모 클래스와 유사한 태스크의 공통 작동을 정의하는 것부터 착수  
Task를 상속받은 2개의 자식 클래스 XYZ, ABC를 정의한 후 이들에 특화된 작동은 두 클래스에 각각 추가함  
클래스 디자인 패턴에서는 메서드 오버라이딩(다형성)을 권장하고, 작동 추가뿐 아니라 때에 따라 오버라이드 이전 원본 메서드를 super 키워드로 호출할 수 있게 지원함  
공통 요소는 추상화하여 부모 클래스의 일반 메서드로 구현하고 자식클래스는 이를 더 세분화(오버라이드)하여 사용
이러한 과정에 대한 의사 코드
```
class Task {
  id;
  // 'Task()' 생성자
  Task(ID) { id = ID; }
  outputTask() { output(id); }
}

class XYZ inherits Task {
  label;

  // 'XYZ()' 생성자
  XYZ(ID, Label) { super(ID); label = Label; }
  outputTask() { super(); output(label); }
}

class ABC inherits Task {
  // ...
}
```
자식 클래스 XYZ의 인스턴스화를 통해 생성된 인스턴스는 XYZ 태스크를 수행  
이 인스턴스는 Task의 일반 작동과 XYZ의 특수 작동 사본을 모두 포함, ABC 클래스의 인스턴스 또한 동일한 과정으로 작동  
인스턴스가 생성되면 원하는 작동은 인스턴스에 모두 복사되어 옮겨진 상태이므로 일반적으로 (클래스가 아닌) 인스턴스와 상호작용을 하게 됨  

### 6.1.2 위임 이론
동일한 문제에 대한 작동 위임 방식 적용  
Task 객체 정의 - 다양한 태스크에서 사용할 유틸리티 메서드가 포함된 구체적인 작동이 기술됨  
태스크별(XYZ, ABC) 객체를 정의하여 고유한 데이터와 작동을 정의, Task 유틸리티 객체에 연결해 필요할 때 특정 태스크 객체가 Task에 작동을 위임하도록 작성  

XYZ 태스크 하나를 실행하기 위해 2개의 형제, 동료 객체(XYZ, Task)로부터 작동을 가져옴 - 그러나 클래스 복사를 통해 이 둘을 조합하지 않아도 각자 별개의 객체로 분리된 상태에서 필요할 때마다 XYZ 객체가 Task 객체에 작동을 위임하는 구조
```javascript
Task = {
  setID: function(ID) { this.id = ID; },
  outputID: function() { console.log(this.id); }
};

// 'XYZ'가 'Task'에 위임
XYZ = Object.create(Task);

XYZ.prepareTask = function(ID, Label) {
  this.setID(ID);
  this.label = Label;
};

XYZ.outputTaskDetails = function() {
  this.outputID();
  console.log(this.label);
};

// ABC = Object.create(Task);
// ABC... = ...
```
Task와 XYZ는 클래스나 함수가 아닌 평범한 객체  
XYZ는 Object.create() 메서드로 Task 객체에 Prototype 위임  
OOLO(Objects Lined to Other Objects) 스타일 코드  
1. id, label 두 데이터 멤버는 XYZ의 직속 프로퍼티. 일반적으로 Prototype 위임 시 상태값은 위임하는 쪽(XYZ, ABC)에 두고 위임반는 쪽(Task)에는 두지 않음
2. 클래스 디자인 패턴에서는 부모(Task)/자식(XYZ) 양쪽에 메서드 이름을 outputTask로 똑같이 붙여 오버라이드(다형성)를 이용함. 작동 패턴은 정반대. 서로 다른 수준의 Prototype 연쇄에서 같은 명칭이 뒤섞이는 일(가려짐)은 되도록 피해야 함. 같은 이름끼리 충돌하면 레퍼런스를 정확히 가려낼 수 없는 부자연스럽고 취약한 구문이 만들어지므로 작동 위임 패턴에서는 오버라이드하기 좋은 일반적인 메서드 명칭보다는 각 객체의 작동 방식을 잘 설명하는 서술적 명칭이 필요. 메서드 이름으로 작동과 의미를 분명하게 하여 코드의 가독성과 유지 보수성 향상
3. this.setID(ID);는 일단 XYZ 객체 내부에서 setID()를 찾지만 XYZ에는 이 메서드가 존재하지 않으므로 Prototype 위임 링크가 체결된 Task로 이동하여 setID()를 발견. 암시적 호출부에 따른 this 바인딩 규칙에 따라 Task에서 발견한 메서드지만 setID() 실행 시 this는 XYZ로 바인딩 됨. 그 다음 this.oudputID()도 동일. XYZ가 Task에 작동을 위임하므로 Task가 가진 일반적인 유틸리티 메서드는 XYZ가 얼마든지 이용 가능해짐  

작동 위임: 찾으려는 프로퍼티/메서드 레퍼런스가 객체에 없으면 다른 객체로 수색 작업을 위임하는 것  
부모/자식 클래스, 상속, 다형성 등의 사상과는 완전히 구별되는 디자인 패턴  

#### 상호 위임(허용되지 않음)
복수의 객체가 양방향으로 상호 위임을 하면 발생하는 사이클은 허용되지 않음  
B->A로 링크된 상태에서 A->B로 링크 시도 시 에러 발생  

#### 디버깅
크롬 개발자 툴 기준 (브라우저나 툴마다 보이는 결과가 같지 않음)  
전통적인 클래스 생성자 스타일 자바스크립트 코드를 크롬 개발자 툴 콘솔창에 입력한 결과
```javascript
function Foo() {}
var a1 = new Foo();
a1; //Foo {}
```
a1는 Foo{}로 평가됨  
동일한 코드가 파이어폭스 콘솔창에서는 Object {}로 표시됨  
크롬 관점 - {}는 Foo라고 명명된 함수가 생성한 빈 객체임  
파이어폭스 관점 - {}는 Object에 의해 일반적으로 생성된 빈 객체  
크롬은 실제로 생성을 일으킨 함수명을 내부 프로퍼티로 간주하여 추적하는 반면, 파이어폭스 등 다른 브라우저는 이러한 추가 정보까지 추적하지는 않음  

```javascript
function Foo() {}
var a1 = new Foo();

a.constructor; // Foo(){}
a.constructor.name; // "Foo"
```
크롬은 Foo 객체 출력 시 .constructor.name만 들여보는가?
```javascript
function Foo() {}
var a1 = new Foo();

Foo.prototype.constructor = function Gotcha() {};

a.constructor; // Gotcha(){}
a.constructor.name; // "Gotcha"

a1; // Foo {}
```
a1.constructor.name을 문법에 맞춰 다르게 바꿨으나 크롬 콘솔창에는 Foo라고 표시됨 - 앞의 질문에 대한 답은 'No'  
OOLO 스타일로 변경한 코드
```javascript
var Foo = {};
var a1 = Object.create(Foo);

a1; // Object {}

Object.defineProperty(Foo, "constructor", {
  enumerable: false,
  value: function Gotcha(){}
});
a1; // Gotcha {}
```
크롬 콘솔창은 .constructor.name을 찾고 이용  
크롬의 내부적인 '생성자명' 추적 기능은 자바스크립트 명세 요건과는 별개로 크론 전용 확장 프로그램을 위해 의도적으로 삽입된 것  
객체 생성 시 '생성자'를 쓰지 않으면 크롬 내부적으로 생성자명을 추적하지 않는 객체 생성, 그런 객체는 Object {}로 제대로 출력되어 'Object()에 의해 생성된 객체'임을 알 수 있음  
OOLO 스타일 코딩의 결함이 아님 - OOLO와 작동 위임 패턴으로 코딩하는 것은 누가 어떤 객체를 생성했는지(어느 함수가 new로 호출됐는지)는 중요하지 않음  
크롬의 내부 생성자명 추적 기능은 클래스 스타일 코딩을 포괄하는 경우에는 유용하나 OOLO 위임만 사용하는 경우 고려할 만한 대상은 아님  

### 6.1.3 멘탈 모델 비교
고전적인 (프로토타입) OO 스타일 코드
```javascript
function Foo(who) {
  this.me = who;
}
Foo.prototype.identify = function() {
  return "I am " + this.me;
};

function Bar(who) {
  Foo.call(this, who);
}
Bar.prototype = Object.create(Foo.prototype);
Bar.prototype.speak = function() {
  alert("Hello, " + this.identify() + ".");
};

var b1 = new Bar("b1");
var b2 = new Bar("b2");

b1.speak();
b2.speak();
```
자식 클래스 Bar는 부모 클래스 Foo를 상속한 뒤 b1과 b2로 인스턴스화  
b1은 Bar.prototype으로 위임되며 이는 다시 Foo.prototype으로 위임됨  

동일한 기능의 OOLO 스타일 코드
```javascript
Foo = {
  init: function(who) {
    this.me = who;
  },
  identify = function() {
    return "I am " + this.me;
  }
};

Bar = Object.create(Foo);
Bar.speak = function() {
  alert("Hello, " + this.identify() + ".");
};

var b1 = Object.create(Bar);
b1.init("b1");
var b2 = Object.create(Bar);
b2.init("b2");

b1.speak();
b2.speak();
```
b1->Bar->Foo로 Prototype 위임 활용, 세 객체는 서로 단단히 연결됨  
생성자, 프로토타입, new 호출을 하면서 클래스처럼 보이게 한 장치들을 쓰지 않고 객체를 서로 연결해주기만 함  
동일한 기능이라면 클래스 스타일보다 OOLO 스타일의 코드 사용이 더 간단하고 편리  

두 예제 코드의 멘탈 모델 개체간 관계 모델링  
클래스 스타일 코드(p.153, 154)    
OOLO 스타일 코드(p.155) - 다른 객체와의 연결에만 집중  

## 6.2 클래스 vs 객체
UI 위젯(버튼, 드롭다운 등) 생성 예제

### 6.2.1 위젯 클래스
고전적 클래스 디자인 코드
```javascript
// 부모 클래스
function Widget(width, height) {
  this.width = width || 50;
  this.height = height || 50;
  this.$elem = null;
}

Widget.prototype.render = function($where) {
  if (this.$elem) {
    this.$elem.css({
      width: this.width + "px",
      height: this.height + "px",
    }).appendTo($where);
  }
};

// 자식 클래스
function Button(width, height, label) {
  // super 생성자 호출
  Widget.call(this, width, height);
  this.label = label || "Default";
  this.$elem = $("<button>").text(this.label);
}

// Button은 Widget으로부터 상속받음
Button.prototype = Object.create(Widget.prototype);

// 상속받은 render() 오버라이드
Button.prototype.render = function($where) {
  // super 호출
  Widget.prototype.render.call(this, $where);
  this.$elem.click(this.onClick.bind(this));
};

Button.prototype.onClick = function(evt) {
  console.log(this.label + " 버튼이 클릭됨");
};

$(document).ready(function() {
  var $body = $(document.body);
  var btn1 = new Button(125, 30, "Hello");
  var btn2 = new Button(150, 40, "World");

  btn1.render("$body");
  btn2.render("$body");
});
```
부모 클래스에는 기본 render()만 선언해두고 자식 클래스가 이를 오버라이드하도록 유도  
기본 기능을 갈아치우기보다 버튼에만 해당하는 작동을 덧붙여 기본 기능을 증강함  
자식 클래스 메서드에서 부모 클래스의 기본 메서드 사용을 위해 가짜 super 호출을 통한 명시적 의사다형성

#### ES6 class 간편 구문
```javascript
class Widget {
  constructor(width, height) {
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
  }
  render($where) {
    if (this.$elem) {
      this.$elem.css({
        width: this.width + "px",
        height: this.height + "px"
      }).appendTo($where);
    }
  }
}

class Button extends Widget {
  constructor(width, height, label) {
    super(width, height);
    this.label = label || "Default";
    this.$elem = $("<button>").text(this.label);
  }
  render($where) {
    super($where);
    this.$elem.click(this.onClick.bind(this));
  }
  onClick(evt) {
    console.log(this.label + " 버튼이 클릭됨");
  }
}

$(document).ready(function() {
  var $body = $(document.body);
  var btn1 = new Button(125, 30, "Hello");
  var btn2 = new Button(150, 40, "World");

  btn1.render($body);
  btn2.render($body);
});
```
Prototype 체계에서 실행되므로 진짜 클래스는 아님

### 6.2.2 위젯 객체의 위임
OLOO 스타일의 위임 적용
```javascript
var Widget = {
  init: function(width, height) {
    this.width = width || 50;
    this.height = height || 50;
    this.$elem = null;
  },
  insert: function($where) {
    if (this.$elem) {
      this.$elem.css({
        width: this.width + "px",
        height: this.height + "px"
      }).appendTo($where);
    }
  }
};
var Button = Object.create(Widget);
Button.setup = function(width, height, label) {
  // 위임 호출
  this.init(width, height);
  this.label = label || "Default";
  this.$elem = $("<button>").text(this.label);
};
Button.build = function($where) {
  // 위임 호출
  this.insert($where);
  this.$elem.click(this.onClick.bind(this));
};
Button.onClick = function(evt) {
  console.log(this.label + " 버튼이 클릭됨");
};

$(document).ready(function() {
  var $body = $(document.body);

  var btn1 = Object.create(Button);
  btn1.setup(125, 30, "Hello");

  var btn2 = Object.create(Button);
  btn2.setup(150, 40, "World");

  btn1.build($body);
  btn2.build($body);
});
```
OOLO 관점에서는 Widget이 부모도, Button이 자식도 아님  
Widget은 보통 객체 - 갖가지 유형의 위젯이 위임하여 사용할 수 있는 유틸리티 창고 역할  
Button - 단독으로 존재하는 객체에 불과(Widget과의 위임 링크는 맺어진 상태)  

render() 메서드를 공유할 필요는 없으며, 대신 각자 수행하는 임무를 구체적으로 드러낼 수 있는 다른 이름(insert, build)들을 메서드에 부여  
init()과 setup() 등 초기화 메서드 이름이 제각각인 이유  
위임 디자인 패턴에서는 이름을 공유하지 않고 각각을 더 서술적으로 명명 가능  
생성자, .prototype, new 등의 구문도 불필요  

클래스 생성 시 한 차례 호출 -> OOLO 패턴에서 호출 부분이 추가됨  
클래스 생성자로는 생성과 초기화를 한 번에 해야 하지만 실제로 OOLO 방식처럼 두 단계로 나누어 실행하면 더 유연해지는 경우가 많음  
필요에 따라 다른 장소에서 다른 시점에 각자 호출하여 사용  
관심사 분리의 원칙(Principle of Seperation of Concerns)이 더 잘 반영된 패턴

## 6.3 더 간단한 디자인
작동 위임 패턴은 코드의 간결성 향상 뿐만 아니라 더 간단한 코드 아키텍처를 가능하게 함  
로그인 페이지 예 - 입력 폼 처리 객체, 서버와 직접 인증(통신)을 수행하는 객체 두 컨트롤러 객체  
전형적인 클래스 디자인 패턴 - Controller 클래스에 기본 기능 포함, 이를 상속받은 LoginController와 AuthController 두 자식 클래스가 상황에 맞게 구체적인 작동 로직을 구현하는 식으로 구성됨
```javascript
// 부모 클래스
function Controller() {
  this.errors = [];
}
Controller.prototype.showDialog(title, msg) {
  // 사용자에게 다이얼로그 창으로 타이틀과 메시지를 표시
};
Controller.prototype.success = function (msg) {
  this.showDialog("Success", msg);
};
Controller.prototype.failure = function (err) {
  this.errors.push(err);
  this.showDialog("Error", err);
};

// 자식 클래스
function LoginController() {
  Controller.call(this);
}
// 자식 클래스를 부모 클래스에 연결
LoginController.prototype = Object.create(Controller.prototype);
LoginController.prototype.getUser = function () {
  return document.getElementById("login_username").value;
};
LoginController.prototype.getPassword = function () {
  return document.getElementById("login_password").value;
};
LoginController.prototype.validateEntry = function (user, pw) {
  user = user || this.getUser();
  pw = pw || this.getPassword();

  if (!(user && pw)) {
    return this.failure("ID와 비밀번호를 입력하여 주십시오");
  } else if (user.length < 5) {
    return this.failure("비밀번호는 5자 이상이어야 합니다");
  }
  // 검증 통과
  return true;
};

// 기본 failure() 확장을 위한 오버라이드
LoginController.prototype.failure = function (err) {
  // super 호출
  Controller.prototype.failure.call(this, "로그인 실패: " + err);
};

function AuthController(login) {
  Controller.call(this);
  // 상속 + 구성
  this.login = login;
}
// 자식 클래스를 부모 클래스에 연결
AuthController.prototype = Object.create(Controller.prototype);
AuthController.prototype.server = function (url, data) {
  return $.ajax({
    url: url,
    data: data
  });
};
AuthController.prototype.checkAuth = function () {
  var user = this.login.getUser();
  var pw = this.login.getPassword();

  if (this.login.validateEntry(user, pw)) {
    this.server("/check-auth", {
      user: user,
      pw: pw
    })
      .then(this.success.bind(this))
      .fail(this.failure.bind(this));
  }
};
// 기본 success() 확장을 위한 오버라이드
AuthController.prototype.success = function () {
  // super 호출
  Controller.prototype.success.call(this, "인증 성공");
};
// failure() 확장을 위한 오버라이드
AuthController.prototype.failure = function (err) {
  // super 호출
  Controller.prototype.failure.call(this, "인증 실패 " + err);
};
var auth = new AuthController();
auth.checkAuth(
  // 상속 + 구성
  new LoginController()
);
```
success(), failure(), showDialog() - 모든 컨트롤러가 공유하는 기본 작동이 구현된 메서드  
LoginController와 AuthController는 failure()와 success()를 오버라이드하여 기본 작동을 증강시킴  
AuthController가 로그인 폼과 연동하기 위해 LoginController 인스턴스 필요 - 멤버 프로퍼티로 보유  
AuthController는 LoginController에 대해 알고 있어야 하므로 new LoginController()로 인스턴스화한 뒤 this.login이라는 클래스 멤버 프로퍼티로 참조함

### 6.3.1 탈클래스화
OOLO 스타일 - 작동 위임 활용
```javascript
var LoginController = {
  errors: [],
  getUser: function () {
    return document.getElementById("login_username").value;
  },
  getPassword: function () {
    return document.getElementById("login_password").value;
  },
  validateEntry: function (user, pw) {
    user = user || this.getUser();
    pw = pw || this.getPassword();

    if (!(user && pw)) {
      return this.failure("ID와 비밀번호를 입력하여 주십시오");
    } else if (user.length < 5) {
      return this.failure("비밀번호는 5자 이상이어야 합니다");
    }
    // 검증 통과
    return true;
  },
  showDialog: function (title, msg) {
    // 사용자 다이얼로그에 성공했다는 메시지 표시
  },
  failure: function (err) {
    this.errors.push(err);
    this.showDialog("에러", "로그인 실패: " + err);
  }
};

// AuthController가 LoginController에 위임하도록 연결
var AuthController = Object.create(LoginController);
AuthController.errors = [];
AuthController.checkAuth = function () {
  var user = this.getUser();
  var pw = this.getPassword();

  if (this.validateEntry(user, pw)) {
    this.server("/check-auth", {
      user: user,
      pw: pw
    })
      .then(this.accepted.bind(this))
      .fail(this.rejected.bind(this));
  }
};
AuthController.server = function (url, data) {
  return $.ajax({
    url: url,
    data: data
  });
};
AuthController.accepted = function () {
  this.showDialog("성공", "인증 성공");
};
AuthController.rejected = function (err) {
  this.failure("인증 실패: " + err);
};
```
AuthController, LoginController는 평범한 객체 - 어떤 작업을 시키기 전에 인스턴스화할 필요 없음  
```javascript
AuthController.checkAuth();
```
OOLO 위임 연쇄에 하나 또는 그 이상의 객체를 추가로 생성해야 할 경우
```javascript
var controller1 = Object.create(AuthController);
var controller2 = Object.create(AuthController);
```
작동 위임 패턴에서 AuthController, LoginController는 수평적 객체 - 클래스 지향 패턴처럼 부모/자식 관계를 억지로 맺을 필요 없음  
둘 사이 작동을 공유하기 위해 징검다리 역할 Controller가 필요 없음  
클래스 자체가 없으므로 클래스 인스턴스화 과정도 생략됨  
필요 시 위임을 통해 두 객체가 서로 협조 가능 형태 - 구성 또한 필요 없음  
success(), failure() 메서드를 똑같은 이름으로 포함하지 않아도 됨 - 클래스 지향 디자인의 다형성 문제 해결  

OOLO 스타일 코드 - 같은 기능을 더 간단한 디자인으로 설계 가능

## 6.4 더 멋진 구문
ES6 class - 클래스 메서드를 짧은 구문으로 선언 가능
```javascript
class Foo {
  methodName() {}
}
```
객체 리터럴에 단축 메서드 선언이 가능 - 다음과 같은 OOLO 스타일 객체 선언 가능
```javascript
var Logincontroller = {
  errors: [],
  getUser() {
    // 'function'이 없음
  },
  getPassword() {

  }
};
```
유일한 차이점 - 객체 리터럴에서는 콤마(,)로 원소를 구분지어야 하지만 class 구문은 그럴 필요가 없음  

ES6부터 프로퍼티를 하나씩 할당할 때 단축 메서드를 사용하여 객체 리터럴로 나타낼 수 있고 객체 Prototype을 Object.setPrototypeOf()로 간단히 수정 가능
```javascript
var AuthController = {
  errors: [],
  checkAuth() {

  },
  server(url, data) {

  }
  // ...
};
// AuthController를 LoginController에 위임
Object.setPrototypeOf(AuthController, LoginController);
```

### 6.4.1 비어휘적 식별자
단축 메서드의 결점
```javascript
var Foo = {
  bar() {}
  baz: function baz() {}
};
```
일반 표현식으로 변환
```javascript
var Foo = {
  bar: function() {}
  baz: function baz() {}
};
```
단축 메서드 bar()가 bar 프로퍼티에 붙여진 익명 함수 표현식이 됨  
함수 객체 자신에 이름 식별자가 없기 때문  

익명 함수에 이름 식별자가 없을 경우의 단점
1. 스택 추적을 통한 디버깅 곤란
2. 재귀, 이벤트 (언)바인딩 등에서 자기 참조가 어려워짐
3. 코드 가독성이 나빠짐  
1, 3번은 단축 메서드에 해당되지 않음  
비간편 구문에서는 스택 추적 시 이름이 나오지 않는 익명 함수 표현식을 사용, 단축 메서드는 내부 프로퍼티 name에 해당 함수 객체를 정확히 지정하므로 스택 추적에 활용 가능  

2번은 단축 메서드의 단점 - 자기 참조에 사용할 수 있는 어휘적 식별자가 없음
```javascript
var Foo = {
  bar: function(x) {
    if (x < 10) {
      return Foo.bar(x * 2);
    }
    return x;
  },
  baz: function baz(x) {
    if (x < 10) {
      return baz(x * 2);
    }
    return x;
  }
};
```
여러 객체가 this 바인딩을 통해 위임을 공유하는 함수처럼 할 수 없는 경우도 많음  
자기 참조가 필요한 상황에 대비하여 함수 객체의 이름 식별자는 지정하는 것을 권장  
단순 함수 선언이라면 단축 메서드보다 baz: function baz(){}와 같이 이름 붙은 함수 표현식 사용이 권장됨

## 6.5 인트로스펙션
타입 인트로스펙션 - 인스턴스를 조사해 객체 유형을 거꾸로 유추하는 것  
클래스 인스턴스에서 타입 인트로스펙션은 주로 인스턴스가 생성된 소스 객체의 구조와 기능을 추론하는 용도로 쓰임  

instanceof 연산자로 객체 a1의 기능을 추론하는 코드
```javascript
function Foo() {
  //...
}
Foo.prototype.something = function() {
  //...
}

var a1 = new Foo();

//중략

if (a1 instanceof Foo) {
  a1.something();
}
```
Foo.prototype - a1의 Prototype 연쇄에 존재 -> instanceof 연산자는 a1이 Foo 클래스의 인스턴스인 것 같은 결과를 반환  

Foo는 일반 객체에 불과, Foo가 참조한 임의의 객체(Foo.prototype)가 우연히 a1에 위임 연결됐을 뿐  
instanceof가 a1과 Foo의 관계를 조사하는 듯 보이지만 실제로는 a1과 Foo.prototype 사이의 관계를 알려주는 것  

instanceof에 의존하여 인트로스펙션을 하는 것은 혼동을 유발하면서 간접적인 방식이므로 해당 객체를 참조하는 레퍼런스를 지닌 함수가 필요  
```javascript
function Foo() {}
Foo.prototype...

function Bar() {}
Bar.prototype = Object.create(Foo.prototype);

var b1 = new Bar("b1");
```
instanceof 연산자와 .prototype을 이용하여 타입 인트로스펙션 실시
```javascript
// Foo와 Bar 관계를 대조
Bar.prototype instanceof Foo; //true
Object.getPrototypeOf(Bar.prototype) === Foo.prototype; //true
Foo.prototype.isPrototypeOf(Bar.prototype); //true

// b1과 Foo, Bar의 관계를 대조
b1 instanceof Foo; //true
b1 instanceof Bar; //true
Object.getPrototypeOf(b1) === Bar.prototype; //true
Foo.prototype.isPrototypeOf(b1); //true
Bar.prototype.isPrototypeOf(b1); //true
```

덕 타이핑(Duck Typing) - 또 다른 타입 인트로스펙션 방식  
위임 가능한 something() 함수를 가진 객체와 a1의 관계를 조사하는 대신 a1.something을 테스트해보고 이것을 통과하면 a1은 .something()을 호출할 수 있다고 간주하는 것
```javascript
if (a1.something) {
  a1.something();
}
```
덕 타이핑은 원래 테스트 결과 이외에 객체의 다른 기능까지 확장하여 추정하는 경향이 있어 리스크가 더해짐(취약한 디자인)  
덕 타이핑 위험성 사례 - ES6 프라미스  
어떤 임의의 객체 레퍼런스가 프라미스인지를 판단해야 할 경우 해당 객체가 then() 함수를 가졌는지 조사하는 식으로 테스트  
어떤 객체에 then() 메서드가 있으면 ES6 프라미스는 무조건 이 객체를 thenable 하다고 단정, 모든 표준 프라미스 작동 로직을 갖추고 있을 것이라고 예상  
우연히 then이라는 이름의 메서드를 가진 non-promise 객체가 있다면 ES6 프라미스 체계와는 분리하여 혼동을 최소화하여야 함  

OOLO 스타일 코드의 타입 인트로스펙션
```javascript
var Foo = {};
var Bar = Object.create(Foo);
Bar...
var b1 = Object.create(Bar);

// Foo와 Bar의 관계를 비교
Foo.isPrototypeOf(Bar); //true
Object.getPrototypeOf(Bar) === Foo; // true
// b1을 Foo, Bar와 비교
Foo.isPrototypeOf(b1); //true
Bar.isPrototypeOf(b1); //true
Object.getPrototypeOf(b1) === Bar; //true
```
클래스와의 연관성과 관련된 혼동을 줄 수 있는 instanceof을 사용하지 않음  
Foo.prototype, Foo.prototye.isPrototypeOf() 등의 구문도 사용되지 않음  
덜 복잡하고 혼동의 여지가 없음