//Object contenant les functions listeners
var listenerFunction = {
    h2Click: function(event){
        /*console.log(this);
        this.style.color = "green"*/
        var element = event.target;
        if(element && element.style.color == "green"){
            element.style.color = "blue"
        }else{
            element.style.color = "green"
        }
        console.log("Click détecté sur la balise H2")
    }
}
//Mise en place des abonnements
var setupListeners = () =>{
    var h2 = document.querySelector('section#html h2')
h2.addEventListener('click', listenerFunction.h2Click)
}