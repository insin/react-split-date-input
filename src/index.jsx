'use strict';

var React = require('react')

var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

var MONTH_NAMES = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ')

var MONTH_NAME_LOOKUP = MONTH_NAMES.reduce((l, m, i) => (l[m] = i, l), {})

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
  , value: React.PropTypes.instanceOf(Date)
  },

  getDefaultProps() {
    return {
      name: 'splitDateInput'
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

  getAdjustedDay(month, year) {
    var daysInNewMonth = daysInMonth(month, year)
    return this.state.day > daysInNewMonth ? daysInNewMonth : this.state.day
  },

  decreaseMonth() {
    var month = this.state.month === 0 ? 11 : this.state.month - 1
    var day = this.getAdjustedDay(month, this.state.year)
    var monthText = MONTH_NAMES[month]
    this.setState({day, dayText: String(day), month, monthText}, this.triggerChange)
  },

  decreaseDay() {
    var day = (this.state.day === 1
               ? daysInMonth(this.state.month, this.state.year)
               : this.state.day - 1)
    this.setState({day, dayText: String(day)}, this.triggerChange)
  },

  decreaseYear() {
    var year = this.state.year - 1
    var day = this.getAdjustedDay(this.state.month, year)
    this.setState({day, dayText: String(day), year, yearText: String(year)}, this.triggerChange)
  },

  increaseMonth() {
    var month = this.state.month === 11 ? 0 : this.state.month + 1
    var day = this.getAdjustedDay(month, this.state.year)
    var monthText = MONTH_NAMES[month]
    this.setState({day, dayText: String(day), month, monthText}, this.triggerChange)
  },

  increaseDay() {
    var day = (this.state.day === daysInMonth(this.state.month, this.state.year)
               ? 1
               : this.state.day + 1)
    this.setState({day, dayText: String(day)}, this.triggerChange)
  },

  increaseYear() {
    var year = this.state.year + 1
    var day = this.getAdjustedDay(this.state.month, year)
    this.setState({day, dayText: String(day), year, yearText: String(year)}, this.triggerChange)
  },

  onMonthChange(e) {
    var monthText = e.target.value
    if (monthText in MONTH_NAME_LOOKUP) {
      var month = MONTH_NAME_LOOKUP[monthText]
      var day = this.getAdjustedDay(month)
      this.setState({day, dayText: String(day), month, monthText}, this.triggerChange)
    }
    else {
      this.setState({monthText})
    }
  },

  onMonthBlur(e) {
    if (this.state.monthText != MONTH_NAMES[this.state.month]) {
      this.setState({monthText: MONTH_NAMES[this.state.month]})
    }
  },

  onDayChange(e) {
    var dayText = e.target.value
    if (/^(?:0?[1-9]|[12][0-9]|3[01])$/.test(dayText) &&
        Number(dayText) <= daysInMonth(this.state.month, this.state.year)) {
      this.setState({day: Number(dayText), dayText}, this.triggerChange)
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

  onYearChange(e) {
    var yearText = e.target.value
    if (/^\d{4,}$/.test(yearText)) {
      var year = Number(yearText)
      var day = this.getAdjustedDay(this.state.month, year)
      this.setState({day, dayText: String(day), year, yearText}, this.triggerChange)
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

  triggerChange() {
    var {year, month, day} = this.state
    this.props.onChange(new Date(year, month, day))
  },

  render() {
    var name = this.props.name
    return <div className="SplitDateInput">
      <div className="SplitDateInput__part SplitDateInput__month">
        <button type="button" onClick={this.increaseMonth} tabIndex="2">+</button>
        <datalist id={name + '-months'}>
          {MONTH_NAMES.map(month => <option value={month} key={month}/>)}
        </datalist>
        <input type="text" name={name + '_month'} value={this.state.monthText} onChange={this.onMonthChange} onBlur={this.onMonthBlur} list={name + '-months'} tabIndex="1" maxLength="3"/>
        <button type="button" onClick={this.decreaseMonth} tabIndex="2">−</button>
      </div>
      <div className="SplitDateInput__part SplitDateInput__day">
        <button type="button" onClick={this.increaseDay} tabIndex="3">+</button>
        <input type="text" name={name + '_day'} value={this.state.dayText} onChange={this.onDayChange} onBlur={this.onDayBlur} tabIndex="1" maxLength="2"/>
        <button type="button" onClick={this.decreaseDay} tabIndex="3">−</button>
      </div>
      <div className="SplitDateInput__part SplitDateInput__year">
        <button type="button" onClick={this.increaseYear} tabIndex="4">+</button>
        <input type="text" name={name + '_year'} value={this.state.yearText} onChange={this.onYearChange} onBlur={this.onYearBlur} tabIndex="1" maxLength="4"/>
        <button type="button" onClick={this.decreaseYear} tabIndex="4">−</button>
      </div>
    </div>
  }
})

module.exports = SplitDateInput