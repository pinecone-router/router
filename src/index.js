const AlpinePlugin = {
    start() {

    }
}

const alpine = window.deferLoadingAlpine || ((callback) => callback())

window.AlpinePlugin = AlpinePlugin

window.deferLoadingAlpine = function (callback) {
    window.AlpinePlugin.start()

    alpine(callback)
}

export default AlpinePlugin
