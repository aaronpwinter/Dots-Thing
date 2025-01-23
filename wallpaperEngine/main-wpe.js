let initSettings = {}
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
            initSettings.color = bg_color
        }
        if(properties.default_image)
        {
            img_link = properties.default_image.value !== '' ? ('file:///' + properties.default_image.value) : 'pusheen.png'
            initSettings.imageLink = img_link
        }
        if(properties.max_dots)
        {
            max_dots = properties.max_dots.value
            initSettings.maxDots = max_dots
        }
        if(properties.default_intensity)
        {
            default_intensity = properties.default_intensity.value
            initSettings.runIntensity = default_intensity
        }
        if(properties.click_intensity)
        {
            click_intensity = properties.click_intensity.value
            initSettings.clickIntensity = click_intensity
        }
        if(properties.mspt)
        {
            mspt = propertiest.mspt.value
            initSettings.mspt = mspt
        }
    }
}

//Wait 1 second for initial settings
setTimeout(() => 
{

let dotted = new DottedImage('dot-image', initSettings.imageLink ? initSettings.imageLink : 'pusheen.png', initSettings)

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
        if(properties.mspt)
        {
            mspt = propertiest.mspt.value
            settings.mspt = mspt
        }
        
        dotted.updateSettings(settings)
    }
}

}, 1000) //Wait 1 second before loading everything