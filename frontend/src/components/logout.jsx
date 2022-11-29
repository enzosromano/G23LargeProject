import React from 'react'


function Logout() {


  return (
    <input type="submit" id="Logout" class="buttons" value="Logout" onClick={() => window.location.href = "/"} />
  )
}

export default Logout