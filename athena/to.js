JSON.stringify(''.split('\n').map(e => {return {type: e.trim().split(' ')[0].split('<')[1], data: e.trim().split(`${e.trim().split(' ')[0].split('<')[1]} `)[1].split('>')[0].split('" ').map(e => {return {type: e.split("=\"")[0], value: e.split("=\"")[1].replace(/"/g, '')}})}}), null, 3)
'asds'.trim().split('\n').map(e => e.trim()).join('')