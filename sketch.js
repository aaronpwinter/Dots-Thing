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
    this._opacity = 255
    this.setColor(color)
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

/**
 * Sets the dot's accleration to move towards a certain point.
 * @param {[number, number]} location The location to move to.
 * @param {*} speed Increase to make the dot acclerate faster.
 * @returns 
 */
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

/**
 * Makes it so the object stops moving towards a point
 */
Dot.prototype.resetMoveTowards = function()
{
    this._towardsAcc = [0,0]
}

/**
 * Sets the dot's accleration to run from a certain point.
 * @param {[number, number]} location The location to run from.
 * @param {number} speed Increase to make dot acclerate faster. Idk honestly.
 */
Dot.prototype.moveFrom = function(location, speed = 100000)
{
    let xDiff = this._loc[0]-location[0]
    let yDiff = this._loc[1]-location[1]
    let distance = xDiff*xDiff + yDiff*yDiff

    this._fromAcc[0] = distance == 0 ? 0 : speed*xDiff/distance - this._vel[0]
    this._fromAcc[1] = distance == 0 ? 0 : speed*yDiff/distance - this._vel[1]
}

/**
 * Makes it so the dot stops moving from a point
 */
Dot.prototype.resetMoveFrom = function()
{
    this._fromAcc = [0,0]
}

/**
 * Sets the color of the string. If the color is an array, then set opacity too (I don't wanna parse text :( )
 * @param {string | [number]} color A color as a string or array of numbers
 */
Dot.prototype.setColor = function(color)
{
    if (typeof(color) === 'string') this._color = color
    else 
    {
        this._color = `rgb(${color[0]},${color[1]},${color[2]},${color.length === 4 ? color[3] : 255})`
        this._opacity = color.length === 4 ? color[3] : 255
    }
}

/**
 * 
 * @param {number} r ... Self explanatory
 */
Dot.prototype.setRadius = function(r)
{
    this._r = r
}

/**
 * 
 * @param {[number, number]} home The new home location for the dot
 */
Dot.prototype.setHome = function(home)
{
    this._home = home
}

/**
 * 
 * @returns {number} The opacity of the dot
 */
Dot.prototype.getOpacity = function()
{
    return this._opacity
}


/*************************************************************************************************************************************************
                                                        Class DottedImage
*************************************************************************************************************************************************/

const DEFAULT_SETTINGS = {
    clickIntensity: 1_000_000,
    runIntensity: 100_000,
    color: '#000000',
    maxDots: 500,
    mspt: 25
}

/**
 * Checks if a setting is included in a setting object. If it is, return that, else return the default
 * @param {string} property The property in question
 * @param {object} settings The settings object
 * @param {object} defaults The default settings object
 * @returns The correct setting
 */
function assignDefualt(property, settings, defaults)
{
    return settings.hasOwnProperty(property) ? settings[property] : defaults[property]
}

/**
 * Takes over an HTML element and creates a version of the image as dots which run from the mouse.
 * @param {string} elementID A string representing the element ID to overwrite.
 * @param {string} imgLink A string representing the image link to initially use.
 * @param {object} settings A object with settings representing initial, non-default settings.
 */
function DottedImage(elementID, imgLink, settings = {})
{
    this._e = document.getElementById(elementID) //The element we are occupying
    this._canvas = document.createElement('canvas')
    this._canvas.style.position = 'absolute'
    this._canvas.style.margin = '0px'
    this._e.appendChild(this._canvas)
    this._context = this._canvas.getContext('2d')

    this._dots = []
    this._hasAddedAllDots = false

    //Settings
    this._clickIntensity = assignDefualt('clickIntensity', settings, DEFAULT_SETTINGS)
    this._runIntensity = assignDefualt('runIntensity', settings, DEFAULT_SETTINGS)
    this._color = assignDefualt('color', settings, DEFAULT_SETTINGS)
    this._maxDots = assignDefualt('maxDots', settings, DEFAULT_SETTINGS)
    this._mspt = assignDefualt('mspt', settings, DEFAULT_SETTINGS) //MS per tick

    this._curIntensity = this._runIntensity

    //Mouse/Cursor interaction with this canvas
    let self = this
    this._mouse = new Mouse(this._canvas)
    this._canvas.addEventListener('mousemove', this._mouse.mouseEvent())
    this._canvas.addEventListener('mousedown', this._mouse.mouseEvent(() => self._curIntensity = self._clickIntensity))
    this._canvas.addEventListener('mouseup', this._mouse.mouseEvent(() => self._curIntensity = self._runIntensity))
    this._canvas.addEventListener('mouseleave', this._mouse.leaveElement())
    this._canvas.addEventListener('mouseout', this._mouse.leaveElement())

    //Window size updates
    this.updateSize()
    window.addEventListener('resize', ()=>self.updateSize())

    //Image Stuffs
    this._imgLnk = imgLink
    this._img = new Image()
    this._img.src = this._imgLnk
    this._img.onload = () => {
        self.convertImg()
    }

    //Updates
    this._interval = null
    this.changedMSPT()

}

/**
 * Makes the canvas size match the size of the parent element, and updates the dots' home locations.
 */
DottedImage.prototype.updateSize = function()
{
    this._canvas.width = this._e.clientWidth
    this._canvas.height = this._e.clientHeight
    if(this._hasAddedAllDots)
    {
        this.resetHomes()
    }
    this.redraw()
}

/**
 * Draws the background (solid color) of the canvas
 */
DottedImage.prototype.fillBack = function()
{
    let originalColor = this._context.fillStyle
    this._context.fillStyle = this._color
    this._context.fillRect(0,0, this._canvas.width, this._canvas.height)
    this._context.fillStyle = originalColor
}

/**
 * Draws everything (background + dots)
 */
DottedImage.prototype.redraw = function()
{
    this.fillBack()
    if(this._hasAddedAllDots)
    {
        this._dots.forEach(element => {
            if(element !== null)
            {
                element.draw(this._context)
            }
        })
    }
}

/**
 * Updates all the dots. Moves them back to home while running from cursor.
 */
DottedImage.prototype.update = function()
{
    if(this._hasAddedAllDots)
    {
        let mouseOn = this._mouse.onElement(), mouseLoc = this._mouse.location()
        this._dots.forEach(element => {
            if (element !== null)
            {
                element.moveTowards()
                if (mouseOn) element.moveFrom(mouseLoc, this._curIntensity)
                else element.resetMoveFrom()
                element.update(this._mspt/1000)
            }
        })
    }
}

/**
 * Used when the mspt is changed.
 */
DottedImage.prototype.changedMSPT = function()
{
    window.clearInterval(this._interval)
    let self = this
    this._interval = window.setInterval(() => {
        self.update()
        self.redraw()
    }, this._mspt)
}

/**
 * Updates the settings of the DottedImage. Resets everything if necessary.
 * @param {object} settings The specific settings to update
 */
DottedImage.prototype.updateSettings = function(settings = {})
{
    let resetAll = false, imgCng = false
    if (settings.clickIntensity)
    {
        this._clickIntensity = settings.clickIntensity
    }
    if (settings.runIntensity)
    {
        this._runIntensity = settings.runIntensity
    }
    if (settings.color)
    {
        this._color = settings.color
    }
    if (settings.maxDots)
    {
        this._maxDots = settings.maxDots
        resetAll = true
    }
    if (settings.imageLink)
    {
        
        this._imgLnk = settings.imageLink
        resetAll = true
        imgCng = true
    }
    if(settings.mspt)
    {
        this._mspt = settings.mspt
        this.changedMSPT()
    }

    if (resetAll)
    {
        if (imgCng)
        {
            this._img.src = this._imgLnk
        }
        else
        {
            this.convertImg()
        }
    }
}

/**
 * Takes the currently loaded image and converts it to a bunch of dots.
 */
DottedImage.prototype.convertImg = function()
{
    this.clearDots()
    this._hasAddedAllDots = false

    let pixels = getAllPixelsAsContinuousNumbersRepresentingEachColorElement(this._img)

    /*
    dots = h/w(d) * d, dots = d^2h/w, dots*w/h = d^2, d = (dots*w/h)**.5, width/d = divider. Heck yeah math (<- that was cring)
    */
    let wD = (this._maxDots*this._img.width/this._img.height)**.5
    let divider = Math.floor(this._img.width/wD)
    //console.log(this._img.width, this._img.height, divider, this._maxDots)
    let across = this._img.width/divider, vert = this._img.height/divider

    let startX = Math.random()*this.width(), startY=Math.random()*this.height()

    this._divider = divider

    for(let i = 0; i < across; i++)
    {
        for(let j = 0; j < vert; j++)
        {
            a = new Dot([startX,startY])

            //Color
            let color = getAvgColorOfPixels(i*divider, j*divider, divider, divider, pixels, this._img)
            if (color[3] === 0) this._dots.push(null) //Completely transparent dot.
            else
            {
                a.setColor(color)
                this._dots.push(a)
            }
        }
    }
    this.resetHomes()
    this._hasAddedAllDots = true
}

/**
 * Takes the currently loaded dots and changes their homes to make sense with the canvas size
 */
DottedImage.prototype.resetHomes = function()
{
    let imgWidth = this._img.width, imgHeight = this._img.height
    let divider = this._divider
    let across = imgWidth/divider, vert = imgHeight/divider
    
    let spacing = Math.min(this.width()/(across+1), this.height()/(vert+1))
    let radius = spacing/2

    let leftSpace = (this.width()-(across-1)*spacing)/2-radius
    let topSpace = (this.height()-(vert-1)*spacing)/2-radius

    for(let i = 0; i < across; i++)
    {
        for(let j = 0; j < vert; j++)
        {
            a = this._dots[i*Math.ceil(vert)+j]
            if (a !== null) 
            {
                a.setHome([i*spacing+leftSpace, j*spacing+topSpace])
                a.setRadius(radius*a.getOpacity()/255)
            }
        }
    }

}

/**
 * The width of the image element
 * @returns The width of the canvas
 */
DottedImage.prototype.width = function()
{
    return this._canvas.width
}

/**
 * The width of the image element
 * @returns The height of the canvas
 */
DottedImage.prototype.height = function()
{
    return this._canvas.height
}

/**
 * Clears all the dots in the object
 */
DottedImage.prototype.clearDots = function()
{
    this._dots = []
}

/*************************************************************************************************************************************************
                                                        Class Mouse
*************************************************************************************************************************************************/
/**
 * Mouse.
 * @param {HTMLElement} element The element which the mouse object records in.
 */
function Mouse(element)
{
    this._x = 0
    this._y = 0
    this._onElement = false
}

Mouse.prototype.x = function() {return this._x}
Mouse.prototype.y = function() {return this._y}
Mouse.prototype.onElement = function() {return this._onElement}
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
        this._onElement = true
        f(event)
    }
}

/**
 * Creates a function that will both call f and update the mouse object. Returns the function
 * @param {function} f The function to be called when the mouseleave happens
 */
Mouse.prototype.leaveElement = function(f = () => {})
{
    return (event) => {
        this._x = event.offsetX
        this._y = event.offsetY
        this._onElement = false
        f(event)
    }
}
/*************************************************************************************************************************************************
                                                        Helper Functions
*************************************************************************************************************************************************/
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
    ctx.drawImage(image, 0, 0, image.width, image.height)
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


const MAX_DOTS = 500
const MSPT = 25
const BG_COLOR = '#000000'
let maxDots = MAX_DOTS
let mspt = MSPT
let color = BG_COLOR
let bg_color = '#000000'
let img_link = 'pusheen.png'


//Local storage
{
    let localMaxDots = localStorage.getItem('max_dots')
    if(localMaxDots !== null)
    {
        maxDots = localMaxDots
    }
    let localMSPT = localStorage.getItem('mspt')
    if(localMSPT !== null)
    {
        mspt = localMSPT
    }
}

//THE THING !!!
let dotted = new DottedImage('canvas1', img_link, settings = {
    maxDots: maxDots,
    mspt: mspt
})



//SETTINGS COG

//Loading a file from harddrive
document.getElementById('fileToLoad').addEventListener('change', ()=>{
    let url = window.URL.createObjectURL(document.getElementById('fileToLoad').files[0])
    dotted.updateSettings({
        imageLink: url
    })
})

//Max Dot setting updates
{
    let dots = document.getElementById('max_dots')
    dots.value = maxDots

    dots.onchange = function()
    {
        maxDots = dots.value
        localStorage.setItem('max_dots', maxDots)
        dotted.updateSettings({
            maxDots: maxDots
        })
    }
}

//MSPT Setting
{
    let mspt_setting = document.getElementById('mspt')
    mspt_setting.value = mspt

    mspt_setting.onchange = function()
    {
        mspt = mspt_setting.value
        localStorage.setItem('mspt', mspt)
        dotted.updateSettings({
            mspt: mspt
        })
    }
}

//Background Setting
{
    let color_set = document.getElementById('bg_color')
    color_set.value = mspt

    color_set.onchange = function()
    {
        color = color_set.value
        dotted.updateSettings({
            color: color
        })
    }
}

//Wallpaper Engine things
window.wallpaperPropertyListener = {
    applyUserProperties: function(properties)
    {
        let settings = {}
        if(properties.background) 
        {
            bg_color = properties.background.value.split(' ')
            bg_color = bg_color.map(function(c) {
                return Math.ceil(c * 255);
            });
            bg_color = 'rgb(' + bg_color + ')'
            settings.color = bg_color
        }
        if(properties.default_image)
        {
            img_link = properties.default_image.value !== '' ? ('file:///' + properties.default_image.value) : 'pusheen.png'
            settings.imageLink = img_link
        }
        if(properties.max_dots)
        {
            max_dots = properties.max_dots.value
            settings.maxDots = max_dots
        }
        if(properties.default_intensity)
        {
            default_intensity = properties.default_intensity.value
            settings.runIntensity = default_intensity
        }
        if(properties.click_intensity)
        {
            click_intensity = properties.click_intensity.value
            settings.clickIntensity = click_intensity
        }
        
        dotted.updateSettings(settings)
    }
}