module.data.osM = typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1;
module.data.shop = null;

module.data.Tags = class Tags {
    constructor(granted) {
        this.set(granted);
        this.enabled = this.Cosmetics ? this.Cosmetics.UserFacingFlags ? this.Cosmetics.UserFacingFlags.HasVariants || this.Cosmetics.UserFacingFlags.Reactive ? true : false : false : false;
    }

    set(granted) {
        let length = granted.length;

        while(length--) {
            const tags = granted[length].gameplayTags;
            let amount = tags.length;

            while(amount--) {
                const tag = tags[amount];
                tag.split('.').reduce((r, a) => r[a] = r[a] || {}, this);
            }
        }

        return this;
    }
}

module.data.Banner = class Banner {
    constructor(banner) {
        const hidden = ['reactive', 'variants', 'styles', 'traversal'];
        this.id = banner.id;
        this.name = banner.name;
        this.intensity = banner.intensity;
        this.data = banner.data;
        this.valid = hidden.find(b => this.name.toLowerCase().includes(b)) || ['collect the set'].find(e => this.name.toLowerCase().includes(e.toLowerCase())) ? false : true;
        this.special = this.valid && !['collect the set'].find(e => this.name.toLowerCase().includes(e.toLowerCase())) ? false : true;
    }
}

module.data.Sections = class Sections {
    constructor(sections) {
        this.raw = sections;
        this.sections = sections;
        this.set();
    }

    set() {
        const keys = Object.keys(this.sections);
        let length = keys.length;

        while(length--) {
            const key = keys[length];
            if(key === 'carousel') continue;
            const section = this.sections[key].sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority)).reverse();
            let lengther = section.length;

            while (lengther--) {
                const item = section[lengther];
                const infront = section[lengther - 1];

                this.createItem(item, item.size.type === 'Small' && infront && infront.size.type === 'Small' ? infront : null);
            }

            this[key] = section;
        }

        return this;
    }

    createItem(item, infront) {
        if(!localStorage.store) localStorage.store = JSON.stringify({
            has: [],
            section: {
                name: null,
                id: null
            }
        });

        let storage = JSON.parse(localStorage.store);
        const div = document.createElement('div');

        const event = (item) => () => {
            storage = JSON.parse(localStorage.store);

            const id = `${item.type.replace(/ /g, '-')}-${item.name.replace(/ /g, '-')}`;
            item.has = item.has ? false : true;

            localStorage.store = JSON.stringify({
                ...storage,
                has: item.has ? storage.has.push(id) ? storage.has : [] : storage.has.filter(e => e !== id)
            });

            storage = JSON.parse(localStorage.store);

            $(`#${item.type.replace(/ /g, '-')}-${item.name.replace(/ /g, '-')}`).attr('type', item.has ? 'has' : '');
        };

        let { size: { width, type: tileSize }, price: { finalPrice: price, regularPrice }, name, type, rarity, assets } = item;
        const banner = item.banner ? new module.data.Banner(item.banner).valid ? new module.data.Banner(item.banner) : null : null;
        const render = assets && assets[0].renderData.Spotlight_Position_Y;
        const tags = new module.data.Tags(item.granted);
        const background = item.rarity ? item.rarity.image1024 ? `url(${item.rarity.image1024});background-size: 100% 100%;background-repeat: no-repeat;` : false : false || assets && assets[0].renderData.Spotlight_Position_Y;

        let colors = {};
        let asset = null;

        if(assets) {
            if(assets[0].renderData.Background_Color_A) {
                const { Background_Color_A: { color: a }, Background_Color_B: { color: b } } = assets[0].renderData;
                asset = assets[0].url;
                colors = {
                    a,
                    b
                };
            }
            else {
                if(rarity) colors = {
                    a: rarity.colorA,
                    b: rarity.colorB
                };
                asset = '';
            }
        }
        else {
            if(rarity) colors = {
                a: rarity.colorA,
                b: rarity.colorB
            };
            asset = '';
        }

        name = item.name || 'Unknown';

        if(tileSize === 'Small' && infront && infront.size.type === 'Small') {
            div.classList.add('other');
            const itemElement = this.createItem(item);
            const InfrontElement = this.createItem(infront).cloneNode(true);
            InfrontElement.onclick = event(infront);
            itemElement.onclick = event(item);
            div.appendChild(itemElement);
            div.appendChild(InfrontElement);
        } else {
            div.classList.add('item');

            if(storage.has.includes(`${item.type.replace(/ /g, '-')}-${name.replace(/ /g, '-')}`)) {
                div.setAttribute('type', 'has');
                item.has = true;
            }

            div.style.cssText = `background: ${typeof background === 'string' ? `${background};${width ? `width:${width};` : ''}` : `${render ? '' : 'radial'}-gradient(circle, ${colors.b}, 50%, ${colors.a} 138%);${width ? `width:${width};` : ''}`}`;
            div.innerHTML = `<img src="${asset}" draggable="false"><div>${tags.enabled ? '<img src="src/images/styles.png">' : ''}<div style="background: ${item.series ? colors.b : rarity ? rarity.colorA : null};"></div><div>${name}<div>${type}</div></div><div><img src="./src/images/vbucks.png"><div><div>${Intl.NumberFormat().format(price)}</div></div>${regularPrice !== price ? `<div>${Intl.NumberFormat().format(regularPrice)}</div>` : ''}</div></div>${render ? `<div style="background: radial-gradient(circle at ${item.assets[0].renderData.Spotlight_Position_X}% ${item.assets[0].renderData.Spotlight_Position_Y}%, ${item.assets[0].renderData.FallOff_Color.color} 0%, transparent 100%); filter: brightness(${item.assets[0].renderData.Gradient_Hardness});"></div>` : '<div></div>'}${banner ? `<div><div style="left: 0;border: 3px solid ${banner.data.border};background: ${banner.data.background};color: ${banner.data.color};">${banner.name}</div></div>` : ''}`;
        }

        item.element = div;
        if(!infront) {
            div.onclick = event(item);
            div.id = `${item.type.replace(/ /g, '-')}-${name.replace(/ /g, '-')}`;
        }

        return div;
    }
}

module.data.Shop = class Shop {
    constructor(otherData) {
        this.main = $('.main');
        this.sections = new module.data.Sections(otherData);
    }

    log(message) {
        console.log('%c[Shop]', 'color: #7289DA', message);
    }

    reCheck() {
        $('.direction').css('display', '');
        const forward = $('.main').next();
        const backwards = $('.main').prev();

        if(forward[0]) {
            $('.direction').children()[1].style.display = '';
            $('.direction').children()[1].innerHTML = forward.children()[1] ? forward.children()[1].children[0].innerText || 'unamed' : 'unamed' || 'unamed';
            $('.direction').children()[1].onclick = () => {
                this.switch('down', false);
            }
        } else $('.direction').children()[1].style.display = 'none';

        if(backwards[0]) {
            $('.direction').children()[0].style.display = '';
            $('.direction').children()[0].innerHTML = backwards.children()[1] ? backwards.children()[1].children[0].innerText || 'unamed' : 'unamed' || 'unamed';
            $('.direction').children()[0].onclick = () => {
                this.switch('up', false);
            }
        } else $('.direction').children()[0].style.display = 'none';
    }

    addAllPanels() {
        const add = () => {
            $('.rows').empty();
            const keys = Object.keys(this.sections.raw);
            let length = keys.length;
    
            while(length--) {
                const key = keys[length];

                if(key === 'carousel') {
                    const carousel = document.createElement('div');
                    document.getElementsByClassName('rows')[0].appendChild(carousel);
                    const { title, url } = this.sections.raw[key];
                    carousel.outerHTML = `<div id="carousel" class="carousel main"><div><div style="background: url(${url}); background-size: 3500% 832%;"><img src="${url}"><div>${title}</div></div></div></div>`;
                    carousel.classList.add('carousel');
                    continue;
                }

                const selected = key === JSON.parse(localStorage.store).section.id;
                const main = document.getElementsByClassName('main')[0];

                this.setPanel(key, selected && !main || keys.length - 1 === length && !main);
            }

            $('.main').nextAll().css('top', '100%');
            $('.main').prevAll().css('top', '-100%');
            
            this.setEvents();

            $('.rows').animate({
                opacity: 1
            }, 500);
        };
        if(new URLSearchParams(window.location.search.split('?')[1]).get('transition') === 'true') {
            $('.rows').animate({
                opacity: 0
            }, 1500);
            setTimeout(() => {
                add();
            }, 1500);
        }
        else add();
    }

    setPanel(type, selected=false) {
        const section = this.sections[type];
        if(!section) return;
        let Panel = null;
        if(!$(`#${type}`)[0]) {
            Panel = document.createElement('div');
            Panel.id = type;

            document.getElementsByClassName('rows')[0].appendChild(Panel);
            Panel.innerHTML = `<div></div><div><div id="main-message">loading<div></div></div></div>`;

            if(selected) {
                if($('.main')[0]) {
                    $('.main').attr('class', '');
                }
                Panel.classList.add('main');
                $('.main').children().eq(1).animate({
                    left: '36px',
                    opacity: 1
                }, 50);
                setTimeout(() => {
                    this.setRowAnimationLoad($('.main'));
                }, 200);
            }
        }
        let length = section.length;

        while(length--) {
            const item = section[length];
            Panel.children[0].appendChild(item.element);
            if(item.size.type === 'Small' && section[length - 1] && section[length - 1].size.type === 'Small') {
                length--;
            }
        }

        Panel.children[1].children[0].innerHTML = section[0].section.name;
        $('.rows').children().css('position', 'absolute').css('top', '100%');
        this.reCheck();
    }

    switch(direction, switching) {
        const next = direction === 'up' ? $('.main').prev() : $('.main').next();
        const element = document.getElementsByClassName('main')[0];
        if(document.getElementsByClassName('main')[1]) document.getElementsByClassName('main')[1].remove();
        if(!next[0]) return;
        switching = true;

        this.log(`Switching to next section, at direction ${direction} (${next[0].id})`);
        $('.main').css('position', 'absolute').animate({
            top: `${direction === 'down' ? '-' : ''}100%`,
            opacity: 0.5
        }, 150);
        this.setRowAnimationCancel();
        next.css('position', 'absolute').animate({
            top: '0px',
            opacity: 1
        }, 150);
        next.children().eq(1).css('left', '').css('opacity', '0');
        setTimeout(() => {
            next[0].style.cssText = '';
            next[0].classList.add('main');
            switching = false;
            next.children().eq(1).animate({
                left: '36px',
                opacity: 1
            }, 50);
            this.setRowAnimationLoad(next);
            this.reCheck();
        }, 150);
        element.classList.remove('main');

        if(this.sections[next[0].id]) localStorage.store = JSON.stringify({
            ...JSON.parse(localStorage.store),
            section: {
                id: next[0].id,
                name: this.sections[next[0].id][0].section.name
            }
        });

    }

    setRowAnimationLoad(row) {
        Array.from(row.children()[0].children).filter(e => e.children[3]).forEach((e) => e.children[3].children[0].style.left = '');
        return Array.from(row.children()[0].children).filter(e => e.className === 'other').forEach((e) => Array.from(e.children).filter(e => e.children[3])[0] ? Array.from(e.children).filter(e => e.children[3])[0].children[3].children[0].style.left = '' : null);
    }

    setRowAnimationCancel(row=$('.main')) {
        Array.from(row.children()[0].children).filter(e => e.children[3]).forEach((e) => e.children[3].children[0].style.left = '0');
        return Array.from(row.children()[0].children).filter(e => e.className === 'other').forEach((e) => Array.from(e.children).filter(e => e.children[3])[0] ? Array.from(e.children).filter(e => e.children[3])[0].children[3].children[0].style.left = '0' : null);
    }

    setEvents() {
        let switching = false;
        const cls = this;
        document.onkeydown = function(e) {
            if(switching) return;
            const { key } = e;
            switch(key) {
                case 'ArrowUp': {
                    cls.switch('up', switching);
                } break;
        
                case 'ArrowDown': {
                    cls.switch('down', switching);
                } break;

                case 'PageUp': {
                    cls.switch('up', switching);
                } break;

                case 'PageDown': {
                    cls.switch('down', switching);
                } break;
            }
        };

        const delay = 1350;
        const body = document.body;
        let position = 0;
        let allow = true;

        document.onwheel = (e) => {
            const direction = e.deltaY < 0 ? 'up' : e.deltaY > 0 ? 'down' : null;

            if(allow && direction) {
                cls.switch(direction, switching);
                allow = false;
                setTimeout(() => {
                    allow = true;
                }, delay);
            }
        }

        window.addEventListener('scroll', () => {
            const direction = body.getBoundingClientRect().top > position ? 'up' : 'down';

            cls.switch(direction, switching);

            position = body.getBoundingClientRect().top;
        });

        let open = false;

        document.querySelectorAll('#updates').forEach(e => e.onclick = () => {
            open = open ? false : true;
            $('.updates')[open ? 'fadeOut' : 'fadeIn']();
            if(!open) {
                $('.updates').css('transform', 'skew(0deg)');
            }
            if(open) {
                $('.updates').fadeOut();
                $('.updates').css('transform', '');
            }
        });
    }
    
    setShop() {
        this.addAllPanels();
    }
}

$(document).ready(async () => {
    try {
        const url = `${localStorage.debug === "true" ? 'http://127.0.0.1:8787' : 'https://api.blobry.com'}/data`;
        if(localStorage.debug === "true") {
            const div = document.createElement('div');
            document.body.appendChild(div);
            div.outerHTML = `<div class="debug">Debug is enabled meaning requests will go to http://127.0.0.1:8787, to disable it type debug.<div></div></div>`;
            $('.debug').animate({
                top: '20px',
                opacity: '1'
            }, 500, () => {
                setTimeout(() => {
                    $('.debug').animate({
                        top: '',
                        opacity: ''
                    }, 300);
                }, 5000);
            });
        }
        $('.updates').children().eq(2).click(() => {
            $('.updates').fadeOut();
            $('.updates').css('transform', '');
        });
        module.data.shop = new module.data.Shop(await (await fetch(url)).json());
        module.data.shop.setShop();
    
        setInterval(async () => {
            module.data.shop = new module.data.Shop(await (await fetch(url)).json());
            module.data.shop.setShop();
        }, 900000);
    } catch(err) {
        handler(err);
    }
});