'use strict';

var React = require('react')

var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

var MONTH_NAMES = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')

var MONTH_NAME_LOOKUP = MONTH_NAMES.reduce((l, m, i) => (l[m.toLowerCase()] = i, l), {})

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0)
}

function daysInMonth(month, year) {
  return (month === 1 && isLeapYear(year) ? 29 : DAYS_IN_MONTH[month])
}

var SplitDateInput = React.createClass({
  propTypes: {
    name: React.PropTypes.string
  , onChange: React.PropTypes.func.isRequired
  , noButtons: React.PropTypes.bool
  , value: React.PropTypes.instanceOf(Date)
  },

  getDefaultProps() {
    return {
      name: 'splitDateInput'
    , noButtons: false
    }
  },

  getInitialState(date) {
    if (typeof date == 'undefined') {
      date = this.props.value
    }
    return {
      month: date.getMonth()
    , year: date.getFullYear()
    , day: date.getDate()
    // Separate *Text state for input values allow the user to type whatever
    // they want, including invalid values. If an invalid value is present
    // onBlur, we will replace it.
    , monthText: MONTH_NAMES[date.getMonth()]
    , dayText: String(date.getDate())
    , yearText: String(date.getFullYear())
    }
  },

  // Shared
  // ======

  triggerChange() {
    var {year, month, day} = this.state
    this.props.onChange(new Date(year, month, day))
  },

  getAdjustedDay(month, year) {
    var daysInNewMonth = daysInMonth(month, year)
    return this.state.day > daysInNewMonth ? daysInNewMonth : this.state.day
  },

  // Month
  // =====

  setMonth(month) {
    var day = this.getAdjustedDay(month, this.state.year)
    var monthText = MONTH_NAMES[month]
    this.setState({day, dayText: String(day), month, monthText}, this.triggerChange)
  },

  decreaseMonth() {
    this.setMonth(this.state.month === 0 ? 11 : this.state.month - 1)
  },

  increaseMonth() {
    this.setMonth(this.state.month === 11 ? 0 : this.state.month + 1)
  },

  onMonthBlur(e) {
    if (this.state.monthText != MONTH_NAMES[this.state.month]) {
      this.setState({monthText: MONTH_NAMES[this.state.month]})
    }
  },

  onMonthChange(e) {
    var monthText = e.target.value
    if (monthText.toLowerCase() in MONTH_NAME_LOOKUP) {
      this.setMonth(MONTH_NAME_LOOKUP[monthText.toLowerCase()])
    }
    else {
      this.setState({monthText})
    }
  },

  onMonthKeyDown(e) {
    var key = e.key
    if (e.target.value.toLowerCase() in MONTH_NAME_LOOKUP &&
        (key == 'ArrowDown' || key == 'ArrowUp' || key =='End' || key == 'Home')) {
      e.preventDefault()
      if (key == 'ArrowDown') {
        this.decreaseMonth()
      }
      else if (key == 'ArrowUp') {
        this.increaseMonth()
      }
      else if (key == 'End') {
        this.setMonth(11)
      }
      else if (key == 'Home') {
        this.setMonth(0)
      }
    }
  },

  // Day
  // ===

  setDay(day) {
    this.setState({day, dayText: String(day)}, this.triggerChange)
  },

  increaseDay() {
    this.setDay(this.state.day === daysInMonth(this.state.month, this.state.year)
                ? 1
                : this.state.day + 1)
  },

  decreaseDay() {
    this.setDay(this.state.day === 1
                ? daysInMonth(this.state.month, this.state.year)
                : this.state.day - 1)
  },

  onDayKeyDown(e) {
    var key = e.key
    if (key == 'ArrowDown' || key == 'ArrowUp' || key =='End' || key == 'Home') {
      e.preventDefault()
      if (key == 'ArrowDown') {
        this.decreaseDay()
      }
      else if (key == 'ArrowUp') {
        this.increaseDay()
      }
      else if (key == 'End') {
        this.setDay(daysInMonth(this.state.month, this.state.year))
      }
      else if (key == 'Home') {
        this.setDay(1)
      }
    }
  },

  onDayChange(e) {
    var dayText = e.target.value
    if (/^(?:0?[1-9]|[12][0-9]|3[01])$/.test(dayText) &&
        Number(dayText) <= daysInMonth(this.state.month, this.state.year)) {
      this.setDay(Number(dayText))
    }
    else {
      this.setState({dayText})
    }
  },

  onDayBlur(e) {
    if (this.state.dayText != String(this.state.day)) {
      this.setState({dayText: String(this.state.day)})
    }
  },

  // Year
  // ====

 setYear(year) {
    var day = this.getAdjustedDay(this.state.month, year)
    this.setState({day, dayText: String(day), year, yearText: String(year)}, this.triggerChange)
  },

  increaseYear(howMuch) {
    this.setYear(this.state.year + 1)
  },

  decreaseYear(howMuch) {
    this.setYear(this.state.year - 1)
  },

  onYearKeyDown(e) {
    var key = e.key
    if (key == 'ArrowDown' || key == 'ArrowUp' || key == 'PageDown' || key == 'PageUp') {
      e.preventDefault()
      if (key == 'ArrowDown') {
        this.decreaseYear()
      }
      else if (key == 'ArrowUp') {
        this.increaseYear()
      }
      else if (key == 'PageDown') {
        this.setYear(this.state.year - 10)
      }
      else if (key == 'PageUp') {
        this.setYear(this.state.year + 10)
      }
    }
  },

  onYearChange(e) {
    var yearText = e.target.value
    if (/^\d{4,}$/.test(yearText)) {
      this.setYear(Number(yearText))
    }
    else {
      this.setState({yearText})
    }
  },

  onYearBlur(e) {
    if (this.state.yearText != String(this.state.year)) {
      this.setState({yearText: String(this.state.year)})
    }
  },

  render() {
    var {name, noButtons} = this.props
    var {monthText, month, dayText, day, yearText, year} = this.state
    var showButtons = !noButtons
    var daysInCurrentMonth = daysInMonth(month, year)
    return <div className={`SplitDateInput SplitDateInput--${noButtons ? 'no' : ''}buttons`}>
      <div className="SplitDateInput__part SplitDateInput__month">
        {showButtons && <button type="button" onClick={this.increaseMonth} tabIndex="-1">
          +
        </button>}
        <datalist id={`${name}-months`}>
          {MONTH_NAMES.map(month => <option value={month} key={month}/>)}
        </datalist>
        <input type="text" name={`S{name}_month`} value={monthText} size="3"
          onKeyDown={this.onMonthKeyDown} onChange={this.onMonthChange} onBlur={this.onMonthBlur}
          tabIndex="0" maxLength="3" autoComplete="off" list={`${name}-months`}
          role="spinbutton" aria-label="Month" aria-valuenow={month}
          aria-valuetext={monthText} aria-valuemin="0" aria-valuemax="11"
        />
        {showButtons && <button type="button" onClick={this.decreaseMonth} tabIndex="-1">
          −
        </button>}
      </div>
      <div className="SplitDateInput__part SplitDateInput__day">
        {showButtons && <button type="button" onClick={this.increaseDay} tabIndex="-1">
          +
        </button>}
        <input type="text" name={`S{name}_day`} value={dayText} size="2"
          onKeyDown={this.onDayKeyDown} onChange={this.onDayChange} onBlur={this.onDayBlur}
          tabIndex="0" maxLength="2" autoComplete="off"
          role="spinbutton" aria-label="Day" aria-valuenow={day}
          aria-valuemin="1" aria-valuemax={daysInCurrentMonth}
        />
        {showButtons && <button type="button" onClick={this.decreaseDay} tabIndex="-1">
          −
        </button>}
      </div>
      <div className="SplitDateInput__part SplitDateInput__year">
        {showButtons && <button type="button" onClick={this.increaseYear} tabIndex="-1">
          +
        </button>}
        <input type="text" name={`S{name}_year`} value={yearText} size="4"
          onKeyDown={this.onYearKeyDown} onChange={this.onYearChange} onBlur={this.onYearBlur}
          tabIndex="0" maxLength="4" autoComplete="off"
          role="spinbutton" aria-label="Year" aria-valuenow={year}
          aria-valuemin="-999" aria-valuemax="9999"
        />
        {showButtons && <button type="button" onClick={this.decreaseYear} tabIndex="-1">
          −
        </button>}
      </div>
    </div>
  }
})

module.exports = SplitDateInput