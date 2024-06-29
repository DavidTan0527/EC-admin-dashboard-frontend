export default function (func : Function, delay : number) {
  let timer : NodeJS.Timeout
  function debounced(...args : any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay)
  }

  debounced.cancel = function (): void {
    if (timer !== null) {
      clearTimeout(timer)
    }
  }

  return debounced
}
