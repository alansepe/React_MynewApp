// Source - https://stackoverflow.com/a/73678597
// Posted by mplus systems, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-27, License - CC BY-SA 4.0

let _obj = {}

export const setGlobal = (obj) => {
    Object.assign(_obj, obj)
}
export const getGlobal = varName => {
   if(_obj[varName] !== undefined){
      return _obj[varName]
   }
   else {
      return null
   }
}

