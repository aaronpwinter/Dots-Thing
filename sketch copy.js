/*************************************************************************************************************************************************
                                                        Class Dot
*************************************************************************************************************************************************/
const DOTRADIUS = 10, DOTCOLOR = '#ffffff'
/**
 * A dot :)
 * @param {[number, number]} location The x,y location of the center of the dot
 * @param {[number, number]} home The x,y location of where the dot belongs :)
 * @param {number} radius The radius of the dot
 * @param {string} color The color of the dot
 */
function Dot(location, home = null, radius = DOTRADIUS, color = DOTCOLOR)
{
    this._r = radius
    this._loc = location
    this._home = home
    this._color = color
    this._vel = [0,0]
    this._acc = [0,0]
    this._towardsAcc = [0,0]
    this._fromAcc = [0,0]
}

/**
 * Draws the dot onto a context.
 */
Dot.prototype.draw = function(context)
{
    context.beginPath()
    context.arc(this._loc[0], this._loc[1], this._r, 0, 2*Math.PI)
    let originalColor = context.fillStyle
    context.fillStyle = this._color
    context.fill()
    context.fillStyle = originalColor
}

/**
 * Moves the dot and updates its velocity
 * @param {number} timePassed Time passed in seconds
 */
Dot.prototype.update = function(timePassed)
{
    this._acc[0] += this._towardsAcc[0] + this._fromAcc[0]
    this._acc[1] += this._towardsAcc[1] + this._fromAcc[1]

    this._loc[0] += this._vel[0]*timePassed
    this._loc[1] += this._vel[1]*timePassed
    this._vel[0] += this._acc[0]*timePassed
    this._vel[1] += this._acc[1]*timePassed

    this._acc[0] -= this._towardsAcc[0] + this._fromAcc[0]
    this._acc[1] -= this._towardsAcc[1] + this._fromAcc[1]
}

Dot.prototype.moveTowards = function(location = null, speed = 20)
{
    if (location === null) 
    {
        if (this._home === null) return
        this.moveTowards(this._home)
    }
    else
    {
        this._towardsAcc = [(location[0]-this._loc[0])*speed-this._vel[0],
                            (location[1]-this._loc[1])*speed-this._vel[1]]
    }
}

Dot.prototype.moveFrom = function(location, speed = 100000)
{
    let xDiff = this._loc[0]-location[0]
    let yDiff = this._loc[1]-location[1]
    let distance = xDiff*xDiff + yDiff*yDiff

    this._fromAcc[0] = distance == 0 ? 0 : speed*xDiff/distance - this._vel[0]
    this._fromAcc[1] = distance == 0 ? 0 : speed*yDiff/distance - this._vel[1]
}

/**
 * Yeah.
 * @returns False when the alpha value is 0
 */
Dot.prototype.setEverythingBasedOffOfImage = function(i, j, divider, spacing, leftSpace, topSpace, pixels, img, baseRadius)
{
    color = getAvgColorOfPixels(i*divider, j*divider, divider, divider, pixels, img)
    this._home = [i*spacing+leftSpace, j*spacing+topSpace]
    this._r = baseRadius*color[3]/255
    this._color = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`
    this._colorReadable = color

    return (color[3] !== 0)
}

Dot.prototype.justSetSomeLocationThings = function(i,j, spacing, leftSpace, topSpace, baseRadius)
{
    this._home = [i*spacing+leftSpace, j*spacing+topSpace]
    this._r = baseRadius*this._colorReadable[3]/255
}

/*************************************************************************************************************************************************
                                                        Class MyCanvas
*************************************************************************************************************************************************/
const SUBWIDTH = 0//23
const SUBHEIGHT = 0//20

/**
 * Canvas with some extra stuff for me
 * @param {object} canvas The canvas. :)
 * @param {Mouse} mouse A mouse :)
 */
function MyCanvas(canvas, mouse, color = '#000000')
{
    this._canvas = canvas 
    this._context = canvas.getContext('2d')
    this._color = color
    this._dots = []
    this._runIntensity = 100000

    this.matchWindowSize()
}

MyCanvas.prototype.canvas = function()
{
    return this._canvas
}

MyCanvas.prototype.context = function()
{
    return this._context
}

MyCanvas.prototype.addDot = function(dot, redraw = false)
{
    this._dots.push(dot)
    if (redraw) this.redraw()
}

MyCanvas.prototype.forEach = function(f)
{
    this._dots.forEach(element => {
        if (element !== null) f(element)
    })
}

/**
 * Fills in the background with the canvas color.
 */
MyCanvas.prototype.fillBack = function()
{
    let originalColor = this._context.fillStyle
    this._context.fillStyle = this._color
    this._context.fillRect(0,0, this._canvas.width, this._canvas.height)
    this._context.fillStyle = originalColor
}

/**
 * Makes the canvas match the size of the window. Updates dots in the canvas too.
 */
MyCanvas.prototype.matchWindowSize = function()
{
    this._canvas.width = this._canvas.parentElement.clientWidth - SUBWIDTH//window.innerWidth - SUBWIDTH
    //this._canvas.height = this._canvas.parentElement.clientHeight - SUBHEIGHT
    this._canvas.height = window.innerHeight - SUBHEIGHT
    this._context = this._canvas.getContext('2d')
    if(this._hasAddedAllDots)
    {
        this.updateAllDots()
    }
    this.redraw()
}

MyCanvas.prototype.redraw = function()
{
    this.fillBack()
    this._dots.forEach(element => {
        if(element !== null)
        {
            element.draw(this._context)
        }
    })
}

MyCanvas.prototype.width = function()
{
    return this._canvas.width
}

MyCanvas.prototype.height = function()
{
    return this._canvas.height
}

/**
 * Updates everything
 * @param {number} timePassed Time passed in seconds
 */
MyCanvas.prototype.update = function(timePassed)
{
    this._dots.forEach(element => {
        if (element !== null)
        {
            element.moveTowards()
            if (m.onscreen()) element.moveFrom(m.location(), this._runIntensity)
            element.update(timePassed)
        }
    })
}

/**
 * Clears the list of dots in the canvas
 */
MyCanvas.prototype.clearDots = function()
{
    this._dots = []
}

/**
 * Takes an image and the maximum amount of dots, and creates a bunch of dots which represent the image
 * @param {image} img The image in question
 * @param {number} max_across The maximum amount of dots spanning across the screen (max # of columns)
 * @param {number} max_vert The maximum amount of dots spanning up and down the screen (max # of rows)
 */
MyCanvas.prototype.newImageNewDots = function(img, max_across = MAX_ACROSS, max_vert = MAX_VERT)
{
    this.clearDots()
    this._hasAddedAllDots = false

    let pixels = getAllPixelsAsContinuousNumbersRepresentingEachColorElement(img)

    //let across = img.naturalWidth, vert = img.naturalHeight
    let divider = Math.floor(Math.max(img.width/max_across,img.height/max_vert))
    let across = img.width/divider, vert = img.height/divider
    
    let spacing = Math.min(window.innerWidth/(across+1), window.innerHeight/(vert+1))
    let radius = spacing/2
    let leftSpace = (window.innerWidth-(across-1)*spacing)/2
    let topSpace = (window.innerHeight-(vert-1)*spacing)/2

    let startX = Math.random()*window.innerWidth, startY=Math.random()*window.innerHeight

    this._imgWidth = img.width, this._imgHeight = img.height
    this._divider = divider

    for(let i = 0; i < across; i++)
    {
        for(let j = 0; j < vert; j++)
        {
            /*
            color = getAvgColorOfPixels(i*divider,j*divider, divider, divider, pixels, img) 
            if (color[3] !== 0)
            {
                r = radius*color[3]/255
                a = new Dot([window.innerWidth/2, window.innerHeight/2], [i*spacing+leftSpace,j*spacing+topSpace], r, 
                            `rgba(${color[0]},${color[1]},${color[2]}, ${color[3]})`)
                //dots.push(a)
                canvasMain.addDot(a)
            }
            */
            a = new Dot([startX, startY])//[window.innerWidth/2, window.innerHeight/2])
            if(a.setEverythingBasedOffOfImage(i, j, divider, spacing, leftSpace, topSpace, pixels, img, radius))
            { 
                this.addDot(a)
            }
            else
            {
                this._dots.push(null)
            }
        }
    }  
    this._hasAddedAllDots = true
}

/**
 * Updates the home and radius of all dots in the canvas, so as to adjust for a new window size or whatever else.
 */
MyCanvas.prototype.updateAllDots = function()
{

    let imgWidth = this._imgWidth, imgHeight = this._imgHeight
    let divider = this._divider
    let across = imgWidth/divider, vert = imgHeight/divider
    
    let spacing = Math.min(window.innerWidth/(across+1), window.innerHeight/(vert+1))
    let radius = spacing/2

    let leftSpace = (window.innerWidth-(across-1)*spacing)/2
    let topSpace = (window.innerHeight-(vert-1)*spacing)/2

    for(let i = 0; i < across; i++)
    {
        for(let j = 0; j < vert; j++)
        {
            a = this._dots[i*Math.ceil(vert)+j]
            if (a !== null) a.justSetSomeLocationThings(i, j, spacing, leftSpace, topSpace, radius)
        }
    }

}

/**
 * Big number mean dot go further from mouse.
 * @param {number} rI Higher means that the dots will run further away from your mouse/have higher accleration away from it.
 */
MyCanvas.prototype.setRunIntensity = function(rI = 100000)
{
    this._runIntensity = rI
}

MyCanvas.prototype.setColor = function(color = '#000000')
{
    this._color = color
}


/*************************************************************************************************************************************************
                                                        Class Mouse
*************************************************************************************************************************************************/
/**
 * Mouse.
 */
function Mouse()
{
    this._x = 0
    this._y = 0
    this._onscreen = false
}

Mouse.prototype.x = function() {return this._x}
Mouse.prototype.y = function() {return this._y}
Mouse.prototype.onscreen = function() {return this._onscreen}
Mouse.prototype.location = function() {return [this._x,this._y]}

/**
 * Creates a function that will both call f and update the mouse object. Returns the function
 * @param {function} f The function to be called when the mouseevent happens
 */
Mouse.prototype.mouseEvent = function(f = () => {})
{
    return (event) => {
        this._x = event.offsetX
        this._y = event.offsetY
        this._onscreen = true
        f(event)
    }
}

/**
 * Creates a function that will both call f and update the mouse object. Returns the function
 * @param {function} f The function to be called when the mouseleave happens
 */
Mouse.prototype.leaveScreen = function(f = () => {})
{
    return (event) => {
        this._x = event.offsetX
        this._y = event.offsetY
        this._onscreen = false
        f(event)
    }
}
/*************************************************************************************************************************************************
                                                        Helper Functions
*************************************************************************************************************************************************/
const UPDATE_TIME = 25

/**
 * Yeah.
 * @param {*} image The image
 * @returns A list of all the pixels in the image, represented as a continous list of color values, 4 values per pixel (r,g,b,a)
 */
function getAllPixelsAsContinuousNumbersRepresentingEachColorElement(image)
{
    let canvTemp = document.createElement('canvas')
    canvTemp.width = image.width
    canvTemp.height = image.height
    let ctx = canvTemp.getContext('2d')
    ctx.drawImage(img, 0, 0, image.width, image.height)
    return ctx.getImageData(0,0,image.width, image.height).data
}

/**
 * Gives the rgba of a single pixel in an image
 * @param {number} x 
 * @param {number} y 
 * @param {*} pixels The result of calling getAllPixelsAsContinuousNumbersRepresentingEachColorObject(img)
 * @param {*} img The image in question
 * @returns 
 */
function getColorAtFromPixelsThing(x, y, pixels, img)
{
    let firstIndex = x*4+y*4*img.width
    let bruh = [
        pixels[firstIndex],
        pixels[firstIndex+1],
        pixels[firstIndex+2],
        pixels[firstIndex+3]
    ]
    return bruh
}

/**
 * Gives the average color of a range of pixels in an image
 * @param {number} x 
 * @param {number} y 
 * @param {number} height 
 * @param {number} width 
 * @param {*} pixels The result of calling getAllPixelsAsContinuousNumbersRepresentingEachColorObject(img)
 * @param {*} img The image in question
 * @returns 
 */
function getAvgColorOfPixels(x, y, height, width, pixels, img)
{
    let color = [0,0,0,0]
    cycles = 0
    for (let i = Math.floor(x); i < width+x && i < img.width; i++)
    {
        for (let j = Math.floor(y); j < height+y && j < img.height; j++)
        {
            let c2 = getColorAtFromPixelsThing(i,j, pixels, img)
            color[0] = color[0] + c2[0]
            color[1] = color[1] + c2[1]
            color[2] = color[2] + c2[2]
            color[3] = color[3] + c2[3]
            cycles++
        }
    }
    color[0] = color[0] / cycles
    color[1] = color[1] / cycles
    color[2] = color[2] / cycles
    color[3] = color[3] / cycles
    return color
}

//Event - Settings show/hide (when clicking cog)
document.getElementById('settings-ul1').style.display = 'none'
function settingsClick()
{
    let settings = document.getElementById('settings-ul1')
    if(settings.style.display == 'none')
    {
        settings.style.display = ''
    }
    else
    {
        settings.style.display = 'none'
    }
}

//Cookies - Unused
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        c = c.trim()
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exdays = null) {
    let cookie = cname + "=" + cvalue + ";"
    if(exdays !== null)
    {
        let d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        cookie += expires + ";";
    }
    document.cookie = cookie + 'path=/;'
}
/*************************************************************************************************************************************************
                                                            MAIN
*************************************************************************************************************************************************/

const MAX_ACROSS = 30
const MAX_VERT = 20
let max_acrs = MAX_ACROSS
let max_verti = MAX_VERT
let bg_color = '#000000'
let img_link = 'pusheen.png'
let default_intensity = 100000
let click_intensity = 1000000



//Inits
let m = new Mouse()
let canvasMain  = new MyCanvas(document.getElementById('canvas1'), m, bg_color)
canvasMain.setRunIntensity(default_intensity)

window.addEventListener('resize', ()=>canvasMain.matchWindowSize())
window.addEventListener('mousemove', m.mouseEvent())
window.addEventListener('mouseleave', m.leaveScreen())

dots = []

/*
d = new Dot([50,50], [100,100], 10, 'rgba(255.5,10,10,1)')
canvasMain.addDot(d)
*/


//Local storage max values
{
    let localAcrs = localStorage.getItem('max_across'), localVert = localStorage.getItem('max_vert')
    if(localAcrs !== null)
    {
        max_acrs = localAcrs
    }
    if(localVert !== null)
    {
        max_verti = localVert
    }
}


//Image loading
let img = new Image()
img.src = img_link
//img.src = 'scren save1.png'
img.onload = () => { 

    canvasMain.newImageNewDots(img,max_acrs,max_verti)

}


//Loading a file from harddrive
document.getElementById('fileToLoad').addEventListener('change', ()=>{
    img.src = window.URL.createObjectURL(document.getElementById('fileToLoad').files[0])
})

//Wallpaper Engine things
window.wallpaperPropertyListener = {
    applyUserProperties: function(properties)
    {
        if(properties.background) 
        {
            bg_color = properties.background.value.split(' ')
            bg_color = bg_color.map(function(c) {
                return Math.ceil(c * 255);
            });
            bg_color = 'rgb(' + bg_color + ')'
            canvasMain.setColor(bg_color)
        }
        if(properties.default_image)
        {
            img_link = properties.default_image.value !== '' ? ('file:///' + properties.default_image.value) : 'pusheen.png'
            img.src = img_link
        }
        if(properties.max_dots_across)
        {
            max_acrs = properties.max_dots_across.value
            img.src = img_link
        }
        if(properties.max_dots_vertical)
        {
            max_verti = properties.max_dots_vertical.value
            img.src = img_link
        }
        if(properties.default_intensity)
        {
            default_intensity = properties.default_intensity.value
            canvasMain.setRunIntensity(default_intensity)
        }
        if(properties.click_intensity)
        {
            click_intensity = properties.click_intensity.value
        }
        
    }
}

//Max_across / vert values
{
    let acrs = document.getElementById('max_across')
    let verti = document.getElementById('max_vert')
    acrs.value = max_acrs
    verti.value = max_verti

    acrs.onchange = function()
    {
        max_acrs = acrs.value
        localStorage.setItem('max_across', max_acrs)
        canvasMain.newImageNewDots(img,max_acrs,max_verti)
    }
    verti.onchange = function()
    {
        max_verti = verti.value
        localStorage.setItem('max_vert', max_verti)
        canvasMain.newImageNewDots(img,max_acrs,max_verti)
    }
}

//Clicking
function clickAndScare()
{
    canvasMain.setRunIntensity(click_intensity)
}
function unScare()
{
    canvasMain.setRunIntensity(default_intensity)
}
window.addEventListener('mousedown', m.mouseEvent(clickAndScare))
window.addEventListener('mouseup', m.mouseEvent(unScare))


//Natural Updates
function update()
{
    canvasMain.update(UPDATE_TIME/1000)
    canvasMain.redraw()
}

window.setInterval(update, UPDATE_TIME)