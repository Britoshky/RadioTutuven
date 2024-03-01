  $(document).ready(function () {
    // Configuración de Trumbowyg con opciones personalizadas
    $('#description').trumbowyg({
      // Configuraciones adicionales aquí
      lang: 'es', // Establece el idioma del editor (código de idioma ISO)
      autogrow: true, // Habilita el ajuste automático de altura
      resetCss: true, // Incluye un conjunto de reglas CSS básicas para evitar conflictos
      semantic: true, // Utiliza HTML semántico
      removeformatPasted: true,
      btnsAdd: ['|', 'fontfamily'], // Añade un separador y el botón personalizado al final de la barra de herramientas
      btns: [
        'viewHTML', '|', 'strong', 'em', '|','underline',
        'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
        '|', 'btnGrp-lists', '|', 'fontfamily', 'fontsize' // Agregado el botón de selección de fuente
      ],
    });
  });
