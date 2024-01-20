window.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'after-each') {
      const route = JSON.parse(event.data.value)
      const query = Object.keys(route.query).reduce((previousValue, currentValue) => {
        if (previousValue) {
          previousValue += '&'
        } else {
          previousValue += '?'
        }
        return previousValue + `${currentValue}=${route.query[currentValue]}`
      }, '')
      history.replaceState({}, '',`${location.pathname + query}#${route.path}` )
    }
  })
  const gasFrame = document.getElementById('gas-frame')
  gasFrame.src = `https://script.google.com/macros/s/${gasDeployId}/exec${location.hash}`
})