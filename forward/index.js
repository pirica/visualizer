const { origin, pathname } = window.location;
const exist = async (path) => {
    let status = 0;

    await $.ajax({
        url: path
    }).catch((e) => {
        status = e.status;
    });

    return status === 0;
};

const blacklist = [];

$(document).ready(async () => {
    const four = async () => {
        const page = await (await fetch('https://visualizer.blobry.com/forward/404.html')).text();
        document.open('text/html');
        document.write(page);
        document.close();
    }
    if(pathname.split('/').length === 2) await four();
    const path = await exist('./index.html');
    if(path && !blacklist.find(e => e.startsWith(pathname))) {
        const data = await (await fetch('./index.html')).text();
        const tags = data.split('<head>')[1].split('</head>')[0].trim().split('<').filter(e => e && !e.startsWith('/'));
        $('body')[0].innerHTML = data.split('<body>')[1].split('</body>')[0];
        let length = tags.length;

        while(length--) {
            const tag = `<${tags[length]}</${tags[length].split(' ')[0]}>`;
            const other = tag.split(`<${tags[length].split(' ')[0]} `)[1].split(`</${tags[length].split(' ')[0]}>`)[0].split('>')[0].split(' ').map(e => {return {type: e.split('"')[0].split('=')[0], value: e.split('"')[1]}});
            const element = document.createElement(tags[length].split(' ')[0].toLowerCase());

            for (let i = 0; i < other.length; i++) {
                const tagI = other[i];
                element[tagI.type] = tagI.value;
            }

            document.getElementsByTagName('head')[0].appendChild(element);
        }

        console.log('%c[Blobry]', 'color: #7289DA', `You're going to the correct destination!`);
    }
    else await four();
});