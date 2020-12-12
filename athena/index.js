$(document).ready(async () => {
    $('#bruh-momento').click(async () => {
        new Modules((await d3.json("./src/index.json")).data);
        $('.error').css('display', 'none');
    });
});