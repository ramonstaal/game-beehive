import { latLngToCell, cellToLatLng, gridDisk } from 'h3-js'

export const GAME_H3_RESOLUTION = 9

export function useH3() {
  function getCellFromLatLng(lat: number, lng: number): string {
    return latLngToCell(lat, lng, GAME_H3_RESOLUTION)
  }

  function getLatLngFromCell(cell: string): { lat: number; lng: number } {
    const [lat, lng] = cellToLatLng(cell)
    return { lat, lng }
  }

  function getNeighbors(cell: string): string[] {
    return gridDisk(cell, 1)
  }

  function getCellCenter(lat: number, lng: number): { lat: number; lng: number; cell: string } {
    const cell = getCellFromLatLng(lat, lng)
    const center = getLatLngFromCell(cell)
    return { ...center, cell }
  }

  return {
    GAME_H3_RESOLUTION,
    getCellFromLatLng,
    getLatLngFromCell,
    getNeighbors,
    getCellCenter,
  }
}
