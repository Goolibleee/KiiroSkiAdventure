import React, {useEffect, useState, useRef} from 'react';
import config from "./api/config";
import sheet_key from "./api/sheet";
import logo from './logo.svg';
import kiiro from './resource/kiiro.png';
import kiiroLeft from './resource/kiiro-sw.png';
import kiiroRight from './resource/kiiro-se.png';
import tree from './resource/tree.png';
import './App.css';
//import 'semantic-ui-css/semantic.min.css';

const spreadsheetID = '12AWolV6lI99LM6NNP1bUwYanAuNDSWRJI8X4-ozM98Q';


//import { GoogleSpreadsheet } from 'google-spreadsheet';
const { GoogleSpreadsheet } = require("google-spreadsheet");

const doc = new GoogleSpreadsheet(spreadsheetID);
//const doc = new GoogleSpreadsheet('1JXha33UfFDKxfp8t909DC1BjurckxPB1xMN__f3FzZk');
//const creds = require('./config/myproject-361608-63d17026f60b.json');

//const context = canvas.getC

let leftDown = false;
let rightDown = false;
let trees = [];
let speed = 0.0;
window.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowLeft":
            leftDown = true;
            break;
        case "ArrowRight":
            rightDown = true;
            break;
        default:
            break;
    }
}, true);
window.addEventListener("keyup", function (event) {
    switch (event.key) {
        case "ArrowLeft":
            leftDown = false;
            break;
        case "ArrowRight":
            rightDown = false;
            break;
        default:
            break;
    }
}, true);
window.addEventListener("mousedown", function (event) {
    const width = window.innerWidth;
    console.log("mouse down " + event.layerX + "," + event.layerY);
    if (event.clientX > width/2)
        rightDown = true;
    if (event.clientX < width/2)
        leftDown = true;
});
window.addEventListener("mouseup", function (event) {
    const width = window.innerWidth;
    console.log("mouse up " + event.clientX + "," + event.clientY);
    if (event.clientX > width/2)
        rightDown = false;
    if (event.clientX < width/2)
        leftDown = false;
});

let pos = {x:250, y:80};

function App() {
    const canvasRef = useRef(null);
	const [name, setName] = useState("");
	const [count, setCount] = useState(0);
	const handleSubmit = async (event) => {
		event.preventDefault();
		console.log(`The name you entered was: ${name} :: ${setName}`);
        const newRow = { ID: name };
        const sheet = doc.sheetsById[1318890137];
        console.log("Append to " + sheet.title + " " + sheet.rowCount);
        await sheet.addRow(newRow);
        setName('');
	}

    const display = (ctx, image, pos) => {
        ctx.drawImage(image, pos.x - image.width/2, pos.y - image.height/2);
    }

    const distance = (pos1, pos2) => {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        return Math.sqrt(dx**2 + dy**2);
    }

    const draw = (ctx, frameCount) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        ctx.fillStyle= 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle= 'blue';
        let displace = 0
        if (leftDown)
            displace = displace - 10;
        if (rightDown)
            displace = displace + 10;
        pos.x = pos.x + displace;
//        ctx.beginPath();
//        ctx.arc(pos, height/2, 30 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
//        ctx.fill();
        let img;
        if (displace === 0)
            img = document.getElementById('kiiro');
        else if (displace < 0)
            img = document.getElementById('kiiro_left');
        else
            img = document.getElementById('kiiro_right');
        display(ctx, img, pos);

        const treeImg = document.getElementById('tree');
        for (let i = 0 ; i < trees.length ; i++)
        {
            display(ctx, treeImg, trees[i]);
            trees[i].y = trees[i].y - speed;
            if (trees[i].y + treeImg.height/2 < 0)
            {
                trees[i].y = height + treeImg.height/2;
                trees[i].x = Math.random() * width;
            }
        }
        if (speed === 0) {
            speed = 1;
        }
        else if (speed < 10) {
            speed *= 1.02;
        }

        // Check collision
        if (speed > 1) {
            for (let i = 0 ; i < trees.length ; i++)
            {
                if (distance(pos, trees[i]) < 25)
                {
                    console.log("Ouch");
//                    console.log(pos);
//                    console.log(trees[i]);
                    speed = 0;
                }
            }
        }
    };

    async function initialize() {
        console.log('initilizeWorker' + config.type);
        await doc.useServiceAccountAuth(config);
        console.log('Succeeded to Auth');
        await doc.loadInfo(); // loads document properties and worksheets
        console.log('Succeeded to load');
        const sheet = doc.sheetsById[1318890137];
        await sheet.loadCells('A1:J1');
        for (let i = 0 ; i < 10 ; i++)
        {
            const cell = sheet.getCell(0,i);
            console.log(cell.value);
        }
        console.log(sheet_key.id);
        console.log(sheet_key.name);
        console.log(sheet.cellStats);

//        const ctx = canvasRef.current.getContext("2d");
        const width = 400; //ctx.canvas.width;
        const height = 400; //ctx.canvas.height;
        for (let i = 0 ; i < 10 ; i++)
        {
            const x = Math.random() * width;
            const y = Math.random() * height;
            trees.push({x: x, y: y});
        }
    }

	useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        draw(ctx, count);
    }, [count]);

	useEffect(() => {
		setInterval(() => {
//            console.log('SetTimeout');
			setCount((count) => count + 1);
//            draw(ctx, count);
		}, 30);
	}, []);

    useEffect(function () {
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },  []);

    useEffect(function () {
        console.log('name changed ' + name);
    },  [name]);
	const clickButton = () => {
		console.log("Clicked");
		alert("Clicked");
	}

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" width="200px"/>
				<p>
					Edit <code>src/App.js</code> and save to reload {count}.
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
				>
					Learn React
				</a>
				<button onClick={clickButton}>
					Click
				</button>
                <canvas id="myCanvas" width="400px" height="400px" ref={canvasRef}> </canvas>
				<form onSubmit={handleSubmit}>
					<label>Enter Your Name:
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</label>
					<input type="submit" />
				</form>
                <div id="invisible">
                    <img id="kiiro" src={kiiro} alt="kiiro"/>
                    <img id="kiiro_left" src={kiiroLeft} alt="kiiroLeft"/>
                    <img id="kiiro_right" src={kiiroRight} alt="kiiroRight"/>
                    <img id="tree" src={tree} alt="tree"/>
                </div>
			</header>
		</div>
	);
}

export default App;
