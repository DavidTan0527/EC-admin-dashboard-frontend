export default function (func : Function, delay : number) {
  let timer : NodeJS.Timeout;
  return function(...args : any[]) {
    const context : any = this;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  };
}
