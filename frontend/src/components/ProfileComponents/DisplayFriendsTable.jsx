import React from 'react'

function DisplayFriendsTable() {
  return (
    <table className="w-full table-auto">
        <thead className="flex flex-row mx-10 my-10 rounded-lg bg-brown-100 text-white content-center">
            <tr>
                <th className="p-3 text-sm font-semibold tracking-wide">My Friend's List</th>
            </tr>
        </thead>

    </table>
  )
}

export default DisplayFriendsTable