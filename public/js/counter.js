// Verifica si ya hay un contador de visitas en el almacenamiento local
if(localStorage.getItem('visits')) {
    // Si ya existe, obtén el valor y conviértelo a un número
    var visits = parseInt(localStorage.getItem('visits'));
} else {
    // Si no existe, establece el valor en 0
    var visits = 0;
}

// Incrementa el contador de visitas
visits++;

// Actualiza el valor en el almacenamiento local
localStorage.setItem('visits', visits);

// Actualiza el contador de visitas en la página
document.getElementById('counter').textContent = visits;
