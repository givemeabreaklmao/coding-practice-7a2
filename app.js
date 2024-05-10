const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
const app = express()
app.use(express.json())
let dataBase = null
const initializeDbAndServer = async () => {
  try {
    dataBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`Error Message ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()
const convertPlayerObjToResponseObj = DbObject => {
  return {
    playerId: DbObject.player_id,
    playerName: DbObject.player_name,
    matchId: DbObject.match_id,
    match: DbObject.match,
    year: DbObject.year,
    playerMatchId: DbObject.player_match_id,
    playerId: DbObject.player_id,
    matchId: DbObject.match_id,
    score: DbObject.score,
    fours: DbObject.fours,
    sixes: DbObject.sixes,
  }
}

const convertMatchDbObjectToResponseObj = DbObject => {
  return {
    matchId: DbObject.match_id,
    match: DbObject.match,
    year: DbObject.year,
  }
}

const convertMatchDetailsDbObjectToResponseObj = DbObject => {
  return {
    matchId: DbObject.match_id,
    match: DbObject.match,
    year: DbObject.year,
  }
}

//Get all players in table

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
    SELECT * FROM player_details ORDER BY player_id;
    `
  const allPlayersArray = await dataBase.all(getAllPlayersQuery)
  response.send(
    allPlayersArray.map(player => convertPlayerObjToResponseObj(player)),
  )
})

//Get player based on id
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerByIdQuery = `
  SELECT * FROM player_details WHERE player_id=${playerId}
  `
  const playerArray = await dataBase.get(getPlayerByIdQuery)
  response.send(convertPlayerObjToResponseObj(playerArray))
})
//Put dateails of player by playerId
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerQuery = `
  UPDATE
  player_details
  SET
  player_name='${playerName}'
  WHERE 
  player_id='${playerId}'
  `
  await dataBase.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
//Get the match details
app.get('/matches/:matchId', async (request, response) => {
  const {matchId} = request.params
  const getMatchQueryId = `
  SELECT 
  *
  FROM
  match_details
  WHERE 
  match_id=${matchId}
  `
  const matchDetails = await dataBase.get(getMatchQueryId)
  response.send(convertMatchDbObjectToResponseObj(matchDetails))
})
//API 5
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getListOfPlayerMatches = `
  SELECT 
  *
  FROM
  player_match_score NATURAL JOIN match_details
  WHERE 
  player_id=${playerId}
  `
  const playerMatchArray = await dataBase.all(getListOfPlayerMatches)
  response.send(
    playerMatchArray.map(match =>
      convertMatchDetailsDbObjectToResponseObj(match),
    ),
  )
})
//API 6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayerOfSpecificMatchQuery = `
  SELECT 
  player_id,player_name
  FROM 
  player_details NATURAL JOIN player_match_score
  WHERE 
  player_match_score.match_id=${matchId}
  `
  const playerDetailsArray = await dataBase.all(getPlayerOfSpecificMatchQuery)
  response.send(
    playerDetailsArray.map(player => convertPlayerObjToResponseObj(player)),
  )
})
//API 7

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getAgregateScoreQuery = `
  SELECT 
  player_id AS playerId,
  player_name AS playerName,
  SUM(score) AS totalScore,
  SUM(fours) AS totalFours,
  SUM(sixes) AS totalSixes
  FROM player_details NATURAL JOIN player_match_score
  WHERE 
  player_id=${playerId}
    `
  const Array = await dataBase.all(getAgregateScoreQuery)
  response.send(Array)
})
module.exports = app
