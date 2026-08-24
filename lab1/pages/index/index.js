// index.js
Page({
  data:{
    gender:'girl'
  },
  onClick:function(){
    if(this.data.gender=='girl')
      this.setData({
        gender:'boy'
      })
    else
      this.setData({
        gender:'girl'
      })
  }
})
