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
let radiusMod = 1.0
let squishMod = 1.0
let xMod = 0.0
let yMod = 0.0


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
    let localRadiusMod = localStorage.getItem('rad_mod')
    if(localRadiusMod !== null)
    {
        radiusMod = parseFloat(localRadiusMod)
    }
    let localSquishMod = localStorage.getItem('squish_mod')
    if(localSquishMod !== null)
    {
        squishMod = parseFloat(localSquishMod)
    }
    let localXMod = localStorage.getItem('x_mod')
    if(localXMod !== null)
    {
        xMod = parseFloat(localXMod)
    }
    let localYMod = localStorage.getItem('y_mod')
    if(localYMod !== null)
    {
        yMod = parseFloat(localYMod)
    }
}

//THE THING !!!
let dotted = new DottedImage('dot-image', img_link, settings = {
    maxDots: maxDots,
    mspt: mspt,
    radiusMod: radiusMod,
    squishMod: squishMod,
    xMod: xMod,
    yMod: yMod
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
        maxDots = parseInt(dots.value)
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

    function showMSPT()
    {
        document.getElementById('mspt-text').innerText = 'MSPT: ' + mspt + ', FPS: ' + 1000/mspt
    }
    showMSPT()

    mspt_setting.onchange = function()
    {
        mspt = parseInt(mspt_setting.value)
        localStorage.setItem('mspt', mspt)
        dotted.updateSettings({
            mspt: mspt
        })
        showMSPT()
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

//radius setting
{
    let rad = document.getElementById('rad_mod')
    rad.value = radiusMod

    function showRadiusMod()
    {
        document.getElementById('rad-mod-text').innerText = 'Radius Multiplier: ' + radiusMod
    }
    showRadiusMod()

    rad.onchange = function()
    {
        radiusMod = parseFloat(rad.value)
        localStorage.setItem('rad_mod', radiusMod)
        dotted.updateSettings({
            radiusMod: radiusMod
        })
        showRadiusMod()
    }
}

//squishing setting
{
    let squish = document.getElementById('squish_mod')
    squish.value = squishMod

    function showSquishMod()
    {
        document.getElementById('squish-mod-text').innerText = 'Squish Factor: ' + squishMod
    }
    showSquishMod()

    squish.onchange = function()
    {
        squishMod = parseFloat(squish.value)
        localStorage.setItem('squish_mod', squishMod)
        dotted.updateSettings({
            squishMod: squishMod
        })
        showSquishMod()
    }
}


//x setting
{
    let xMov = document.getElementById('x_mod')
    xMov.value = xMod

    function showXMod()
    {
        document.getElementById('x-mod-text').innerText = 'X + ' + xMod
    }
    showXMod()

    xMov.onchange = function()
    {
        xMod = parseFloat(xMov.value)
        localStorage.setItem('x_mod', xMod)
        dotted.updateSettings({
            xMod: xMod
        })
        showXMod()
    }
}

//y setting
{
    let yMov = document.getElementById('y_mod')
    yMov.value = yMod

    function showYMod()
    {
        document.getElementById('y-mod-text').innerText = 'Y + ' + yMod
    }
    showYMod()

    yMov.onchange = function()
    {
        yMod = parseFloat(yMov.value)
        localStorage.setItem('y_mod', yMod)
        dotted.updateSettings({
            yMod: yMod
        })
        showYMod()
    }
}