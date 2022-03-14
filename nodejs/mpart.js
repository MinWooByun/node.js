let M = {
  v: "v",
  f: () => {
    console.log(this.v);
  },
};

// 외부에서도 M 객체를 사용할 수 있다.
module.exports = M;
