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
let dotted = new DottedImage('dot-image', img_link, settings = {
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

    function showMSPT()
    {
        document.getElementById('mspt-text').innerText = 'MSPT: ' + mspt + ', FPS: ' + 1000/mspt
    }
    showMSPT()

    mspt_setting.onchange = function()
    {
        mspt = mspt_setting.value
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
