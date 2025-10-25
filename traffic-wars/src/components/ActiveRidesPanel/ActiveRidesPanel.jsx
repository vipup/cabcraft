import React, { useState, useEffect } from 'react'
import { useGame } from '../../context/GameContext'
import { useMobileOptimization } from '../../hooks/useMobileOptimization'
import './ActiveRidesPanel.css'

const ActiveRidesPanel = () => {
  const { rideRequests, ridesFilter, ridesSort, selectedRideId, autoSwitchRides, setRidesFilter, setRidesSort, setSelectedRideId, setAutoSwitchRides } = useGame()
  const { isMobile } = useMobileOptimization()
  const [isVisible, setIsVisible] = useState(false)
  
  const handleSearchChange = (e) => {
    setRidesFilter({ ...ridesFilter, search: e.target.value.toLowerCase() })
  }
  
  const handleStatusChange = (status, checked) => {
    setRidesFilter({
      ...ridesFilter,
      status: { ...ridesFilter.status, [status]: checked }
    })
  }
  
  const handleSort = (field) => {
    setRidesSort({
      field,
      ascending: ridesSort.field === field ? !ridesSort.ascending : true
    })
  }
  
  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }
  
  // Auto-hide on mobile when clicking outside
  useEffect(() => {
    if (isMobile && isVisible) {
      const handleClickOutside = (e) => {
        const panel = document.querySelector('.active-rides-panel')
        if (panel && !panel.contains(e.target)) {
          setIsVisible(false)
        }
      }
      
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobile, isVisible])
  
  // Filter and sort rides
  let filteredRides = rideRequests.filter(ride => {
    const matchesSearch = !ridesFilter.search || 
      ride.id.toString().includes(ridesFilter.search) ||
      ride.fare.toString().includes(ridesFilter.search)
    
    const status = ride.assignedDriver ? 
      (ride.assignedDriver.status === 'on_ride' ? 'inProgress' : 'waiting') :
      'waiting'
    const matchesStatus = ridesFilter.status[status]
    
    return matchesSearch && matchesStatus
  })
  
  // Sort
  filteredRides.sort((a, b) => {
    const aVal = a[ridesSort.field] || 0
    const bVal = b[ridesSort.field] || 0
    return ridesSort.ascending ? aVal - bVal : bVal - aVal
  })
  
  return (
    <>
      {/* Mobile toggle button */}
      {isMobile && (
        <button 
          className="mobile-rides-toggle"
          onClick={toggleVisibility}
          title="Toggle Rides Panel"
        >
          📋 {isVisible ? 'Hide' : 'Show'} Rides
        </button>
      )}
      
      <div className={`active-rides-panel ${isMobile && isVisible ? 'visible' : ''}`}>
        <h3>Active Rides</h3>
      
      <div className="rides-controls">
        <div className="search-controls">
          <label>Search:</label>
          <input 
            type="text" 
            placeholder="ID, fare, status..."
            value={ridesFilter.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="filter-controls">
          <label>Status:</label>
          <div className="status-bullets">
            <label className="status-bullet-label">
              <input 
                type="checkbox" 
                checked={ridesFilter.status.waiting}
                onChange={(e) => handleStatusChange('waiting', e.target.checked)}
              />
              <span className="status-bullet waiting">⏳</span>
            </label>
            <label className="status-bullet-label">
              <input 
                type="checkbox" 
                checked={ridesFilter.status.inProgress}
                onChange={(e) => handleStatusChange('inProgress', e.target.checked)}
              />
              <span className="status-bullet in-progress">🚗</span>
            </label>
            <label className="status-bullet-label">
              <input 
                type="checkbox" 
                checked={ridesFilter.status.completed}
                onChange={(e) => handleStatusChange('completed', e.target.checked)}
              />
              <span className="status-bullet completed">✅</span>
            </label>
          </div>
        </div>
        
        <div className="auto-switch-controls">
          <label className="auto-switch-label">
            <input 
              type="checkbox" 
              checked={autoSwitchRides}
              onChange={(e) => setAutoSwitchRides(e.target.checked)}
            />
            <span className="auto-switch-text">🔄 Auto Switch</span>
          </label>
        </div>
        
        <div className="quick-stats">
          <span className="stat-item">Total: {rideRequests.length}</span>
          <span className="stat-item">Filtered: {filteredRides.length}</span>
        </div>
      </div>
      
      <div className="table-container">
        <table className="rides-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID</th>
              <th onClick={() => handleSort('type')}>Type</th>
              <th onClick={() => handleSort('status')}>Status</th>
              <th onClick={() => handleSort('fare')}>Fare</th>
              <th>Pickup</th>
              <th>Dropoff</th>
            </tr>
          </thead>
          <tbody>
            {filteredRides.length === 0 ? (
              <tr><td colSpan="6">No active rides</td></tr>
            ) : (
              filteredRides.map(ride => {
                const rideTypeEmoji = ride.type === 'air' ? '✈️' : '🚗'
                const isSelected = selectedRideId === ride.id
                return (
                  <tr 
                    key={ride.id} 
                    className={isSelected ? 'selected-row' : ''}
                    onClick={() => setSelectedRideId(isSelected ? null : ride.id)}
                  >
                    <td>#{ride.id}</td>
                    <td>{rideTypeEmoji}</td>
                    <td>
                      <span className={`status-badge ${ride.assignedDriver ? 'in-progress' : 'waiting'}`}>
                        {ride.assignedDriver ? '🚗' : '⏳'}
                      </span>
                    </td>
                    <td>${ride.fare}</td>
                    <td>{Math.round(ride.pickupX)},{Math.round(ride.pickupY)}</td>
                    <td>{Math.round(ride.dropoffX)},{Math.round(ride.dropoffY)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      </div>
    </>
  )
}

export default ActiveRidesPanel

