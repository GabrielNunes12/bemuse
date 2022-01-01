import * as BMS from 'bms'
import _ from 'lodash'
import Notechart from '../'
import { PlayerOptions, NotechartInput, ExpertJudgmentWindow } from '../types'

// Returns a new Notechart from a BMSChart.
export function fromBMSChart(bms: BMS.BMSChart, playerOptions: PlayerOptions) {
  let notes = BMS.Notes.fromBMSChart(bms, {
    mapping: playerOptions.double
      ? BMS.Notes.CHANNEL_MAPPING.IIDX_DP
      : BMS.Notes.CHANNEL_MAPPING.IIDX_P1,
  }).all()

  let landmineNotes = BMS.Notes.fromBMSChart(bms, {
    mapping: playerOptions.double
      ? BMS.Notes.CHANNEL_MAPPING.IIDX_DP_LANDMINE
      : BMS.Notes.CHANNEL_MAPPING.IIDX_P1_LANDMINE,
  }).all()

  let timing = BMS.Timing.fromBMSChart(bms)
  let keysounds = BMS.Keysounds.fromBMSChart(bms)
  let songInfo = BMS.SongInfo.fromBMSChart(bms)
  let positioning = BMS.Positioning.fromBMSChart(bms)
  let spacing = BMS.Spacing.fromBMSChart(bms)

  let data: NotechartInput = {
    notes,
    landmineNotes,
    timing,
    keysounds,
    songInfo,
    positioning,
    spacing,
    barLines: generateBarLinesFromBMS(notes, bms),
    expertJudgmentWindow: getJudgmentWindowFromBMS(bms),
  }
  return new Notechart(data, playerOptions)
}

function getJudgmentWindowFromBMS(bms: BMS.BMSChart): ExpertJudgmentWindow {
  // http://hitkey.nekokan.dyndns.info/diary1501.php
  const rank = +bms.headers.get('rank')! || 2
  if (rank === 0) return [8, 24] // Very Hard
  if (rank === 1) return [15, 30] // Hard
  if (rank === 3) return [21, 60] // Easy
  return [18, 40] // Normal
}

function generateBarLinesFromBMS(bmsNotes: BMS.BMSNote[], bms: BMS.BMSChart) {
  let max = _.max(bmsNotes.map((note) => note.endBeat || note.beat)) || 0
  let barLines = [0]
  let currentBeat = 0
  let currentMeasure = 0
  do {
    currentBeat += bms.timeSignatures.getBeats(currentMeasure)
    currentMeasure += 1
    barLines.push(currentBeat)
  } while (currentBeat <= max)
  return barLines
}
