function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    
    // Agrega un cero delante si el valor es menor que 10
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;
    
    // Muestra la hora en el formato HH:MM:SS
    var timeString = hours + ":" + minutes + ":" + seconds;
    
    // Actualiza el contenido del elemento con id "clock"
    document.getElementById("clock").innerHTML = timeString;
  }
  
  // Llama a la función updateClock() cada segundo
  setInterval(updateClock, 1000);
  
  // Llama a la función updateClock() cuando la página se carga por primera vez
  updateClock();
  