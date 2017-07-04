
class A {
  static from(): A { return new A(); }
  project(a:string[], b:string[]) { console.log("hello"); }
}

A.from().project(["s"], ["s"]);




