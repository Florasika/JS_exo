//Object contenant les functions listeners
var listenerFunction = {
    h2Click: () =>{
        window.alert("Click détecté sur la balise H2")
    }
}
//Mise en place des abonnements
var setupListeners = () =>{
    var h2 = document.querySelector('section#html h2')
h2.addEventListener('click', listenerFunction.h2Click)
}