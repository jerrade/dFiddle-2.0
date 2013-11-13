define(function () {
    var MainTab = function (dto) {
        return mapToObservable(dto);
    }

    var HourlyUnsubmitted = function (dto) {
        return mapToObservable(dto);
    }

    var HourlyPartialForDropdown = function (dto) {
        return mapToObservable(dto);
    }

    var ImpersonableEmployee = function (dto) {
        if (dto != null) {
            var mapping = {
                'copy': ["ID", "Username", "FullName"]
            }

            ko.mapping.fromJS(dto, mapping, this);
        }
    }

    var PageDetail = function (dto) {
        if (dto != null) {
            var mapping = {
                'copy': ["CanImpersonate"],
                'ImpersonableEmployees': {
                    create: function (options) {                       
                        return new ImpersonableEmployee(options.data);
                    }
                }
            }

            ko.mapping.fromJS(dto, mapping, this);
        }
    }

    var Tab = function (dto) {
        if (dto != null) {
            var mapping = {                
            }

            ko.mapping.fromJS(dto, mapping, this);
        }
    }

    var HourlyTimesheet = function (dto) {
        var timesheet = this;
        var isLocked = dto.IsLocked;
        if(dto != null){
            var mapping = {
                'copy': ["EmployeeHourlyId", "WeekOf", "PayPeriod", "VacationHoursRemaining", "VacationHoursClaimed", "SickHoursRemaining", "SickHoursClaimed", "VacationSickDate", "PaidTimeClaimed", "PayPeriodDisplay", "DaysRemainingInPeriod", "PreviousUnsubmitted", "IsLocked", "Holidays", "HolidayHoursInPeriod", "WorkHoursInPeriod"],
                'Jobs': {
                    create: function (options) {
                        /* I wanted to pass in the timesheet object instead of just isLocked, but it didn't have the IsLocked 
                           property mapped yet when the HourlyJob constructor is called. */
                        return new HourlyJob(options.data, isLocked);
                    }                
                },
                'TimeOff': {
                    create: function (options) {
                        return new HourlyTimeOff(options.data);
                    }
                },
                'Summary': {
                    create: function (options) {
                        return new HourlySummary(options.data, timesheet);
                    }
                },
                'ApprovalDates': {
                    create: function (options) {
                        return new ApprovedDate(options.data, timesheet);
                    }
                }
            };

            ko.mapping.fromJS(dto, mapping, this);

            this.toJSON = function () {
                var copy = ko.toJS(this);
                delete copy.__ko_mapping__;
                delete copy.WeekOfDisplay;
                delete copy.VacationHoursRemaining;
                delete copy.VacationHoursClaimed;
                delete copy.SickHoursRemaining;
                delete copy.SickHoursClaimed;
                delete copy.VacationSickDate;
                delete copy.PaidTimeClaimed;
                delete copy.DateSubmitted;
                delete copy.EmployeeIsLoggedIn;
                delete copy.PreviousUnsubmitted;
                delete copy.IsLocked;
                delete copy.HolidayHoursInPeriod;
                delete copy.WorkHoursInPeriod;
                delete copy.Holidays;
                delete copy.PeriodStartDate;
                delete copy.PeriodEndDate;
                delete copy.PayPeriodDisplay;
                delete copy.DaysRemainingInPeriod;
                delete copy.HoursAffirmed;
                delete copy.TotalOvertimeForWeek;
                delete copy.TotalOverallForPeriod;
                delete copy.TotalNonHolidayForPeriod;
                delete copy.HolidayHours;
                delete copy.DateSubmittedPretty;
                delete copy.SaveButtonVisible;
                delete copy.SubmitButtonVisible;
                delete copy.SubmitButtonHoverText;
                delete copy.VacationHoursExceeded;
                delete copy.SickHoursExceeded;
                delete copy.Summary;
                delete copy.ApprovalDates;
                return copy;
            };

            this.HoursAffirmed = ko.observable(false);

            /* This will sum all the regular hours over all jobs for the given day. 
               If the dayOfWeek is 0 or undefined, then it will give the sum for all days. */
            this.TotalRegularForDay = function (dayOfWeek) {
                var total = 0;
                var that = this;

                ko.utils.arrayForEach(that.Jobs(), function (jobItem) {
                    ko.utils.arrayForEach(jobItem.Hours(), function (hourItem) {
                        if (hourItem.DayOfWeek === dayOfWeek || dayOfWeek === 0 || dayOfWeek === undefined) {
                            /* Sum the hours for non-current periods for the daily totals, but not for the overall total. */
                            if (hourItem.InCurrentPeriod || hourItem.DayOfWeek === dayOfWeek)
                                total += hourItem.Hours() * 1;
                        }
                    });
                });
                return total;
            }.bind(this);

            /* This will sum all the regular hours over all jobs for the given day. 
               If the dayOfWeek is 0 or undefined, then it will give the sum for all days. */
            this.TotalOvertimeForWeek = ko.computed(function () {
                var total = 0;                

                total = this.TotalRegularForDay(0);

                if (total > 40)
                    total -= 40;
                else
                    total = 0;
                return total;
            }, this);

            this.TotalOvertimeForWeek.efficientlySubscribe(function (newValue) {
                /*  When the total overtime changes, apply it all to the single job if there is only one job. */
                if (timesheet.Jobs().length == 1) {
                    timesheet.Jobs()[0].OvertimePortion(newValue);
                }
            });

            /* This will sum all the hours for the current period. */
            this.TotalOverallForPeriod = ko.computed(function () {
                var total = 0;
                var that = this;

                ko.utils.arrayForEach(this.Summary(), function (item) {
                    total += item.Total() * 1;
                });
                return total;
            }, this);

            /* This will sum all the non-holiday hours for the current period. */
            this.TotalNonHolidayForPeriod = ko.computed(function () {
                var total = 0;
                var that = this;

                ko.utils.arrayForEach(this.Summary(), function (item) {
                    if(item.HoursType != 'H')
                        total += item.Total() * 1;
                });
                return total;
            }, this);

            this.HolidaysText = function () {
                if (timesheet.Holidays == null)
                    return '(no holidays this period)';
                else
                    return '(' + timesheet.Holidays + ')';
            }

            this.HolidayHours = ko.computed(function () {
                var nonHolidayHours, hours;
                
                if (this.TotalNonHolidayForPeriod() > (this.WorkHoursInPeriod - this.HolidayHoursInPeriod))
                    nonHolidayHours = this.WorkHoursInPeriod;
                else
                    nonHolidayHours = this.TotalNonHolidayForPeriod();

                hours = nonHolidayHours / (this.TotalNonHolidayForPeriod() - this.HolidayHoursInPeriod) * this.HolidayHoursInPeriod;
                if (hours > this.HolidayHoursInPeriod)
                    hours = this.HolidayHoursInPeriod;
                return hours;

            }, this);

            this.DateSubmittedPretty = ko.computed(function () {
                if (this.DateSubmitted() == null)
                    return '';
                else
                    return moment(this.DateSubmitted()).format('LLLL');
            }, this);

            this.SaveButtonVisible = ko.computed(function () {
                return this.DateSubmitted() == null;
            }, this);

            this.SubmitButtonVisible = ko.computed(function () {
                return this.DateSubmitted() == null && this.EmployeeIsLoggedIn() == true && this.PreviousUnsubmitted == null;
            }, this);

            this.SubmitButtonHoverText = ko.computed(function () {
                if (this.HoursAffirmed())
                    return null;
                else
                    return 'Please check the box above to affirm that your hours entered are correct.';
            }, this);

            this.VacationHoursExceeded = ko.computed(function () {
                var vacationHours = 0, vacation;
                vacation = ko.utils.arrayFirst(this.TimeOff(), function (item) {
                    return item.HoursType == 'V';
                });
                if (vacation == null)
                    vacationHours = 0;
                else
                    vacationHours = vacation.Total();
                return this.VacationHoursClaimed * 1 + vacationHours * 1 > this.VacationHoursRemaining;
            }, this);

            this.SickHoursExceeded = ko.computed(function () {
                var sickHours = 0, sick;
                sick = ko.utils.arrayFirst(this.TimeOff(), function (item) {
                    return item.HoursType == 'S';
                });
                if (sick == null)
                    sickHours = 0;
                else
                    sickHours = sick.Total();
                return this.SickHoursClaimed * 1 + sickHours * 1 > this.SickHoursRemaining;
            }, this);
        }
    }

    var HourlyJob = function(dto, isLocked){
        if (dto != null) {
            var mapping = {
                'copy': ["GrantName", "JobCode", "JobTitle", "SupervisorName", "JobHourlyId", "HoursPerWeek"],
                'Hours': {
                    create: function (options) {
                        return new HourlyJobHour(options.data, isLocked);
                    }
                }
            };

            ko.mapping.fromJS(dto, mapping, this);

            this.toJSON = function () {
                var copy = ko.toJS(this);
                delete copy.__ko_mapping__;
                delete copy.GrantName;
                delete copy.JobCode;
                delete copy.JobTitle;
                delete copy.SupervisorName;
                delete copy.HoursPerWeek;
                return copy;
            };

            /* The total of regular hours for the job for the week/pay period. */
            this.Total = ko.computed(function () {
                var total = 0;
                ko.utils.arrayForEach(this.Hours(), function (item) {
                    if(item.InCurrentPeriod)
                        total += item.Hours() * 1;
                });
                return total;
            }, this);
        }
    }

    var HourlyJobHour = function (dto, isLocked) {
        if (dto != null) {
            var mapping = {
                'copy': ["GrantName", "JobCode", "JobHourlyId", "DayOfWeek", "InCurrentPeriod", "IsEffective", "HolidayName"]
            };

            ko.mapping.fromJS(dto, mapping, this);

            this.toJSON = function () {
                var copy = ko.toJS(this);
                delete copy.__ko_mapping__;
                delete copy.GrantName;
                delete copy.JobCode;
                delete copy.DayDate;
                delete copy.HolidayName;
                delete copy.InCurrentPeriod;
                delete copy.IsEffective;
                delete copy.DisplayDate;
                delete copy.IsDisabled;
                return copy;
            };

            this.DisplayDate = moment(dto.DayDate).format('ddd[<br/>]M/D');
            //if (this.HolidayName != '')
            //    this.DisplayDate += '<br/><span style="font-size: x-small">' + this.HolidayName + '</span>';

            this.IsDisabled = !dto.InCurrentPeriod || !dto.IsEffective || isLocked;
        }
    }

    var HourlyTimeOff = function (dto) {
        if (dto != null) {
            var mapping = {
                'copy': ["HoursType", "Name"],
                'Hours': {
                    create: function (options) {
                        return new HourlyTimeOffHour(options.data);
                    }
                }
            };

            ko.mapping.fromJS(dto, mapping, this);

            this.toJSON = function () {
                var copy = ko.toJS(this);
                delete copy.__ko_mapping__;
                delete copy.Name;
                return copy;
            };

            /* The total of hours for the time off type. */
            this.Total = ko.computed(function () {
                var total = 0;
                ko.utils.arrayForEach(this.Hours(), function (item) {
                    if(item.InCurrentPeriod)
                        total += item.Hours() * 1;
                });
                return total;
            }, this);
        }
    }

    var HourlySummary = function (dto, parent) {
        var that = this;
        if (dto != null) {
            var mapping = {
                'copy': ["HoursType", "HoursTypeName"]
            };

            ko.mapping.fromJS(dto, mapping, this);

            /* The total of hours for the time off type. */
            this.Total = ko.computed(
                {
                    read: function () {
                        var total = 0;

                        /* The total is equal to the value returned in the Summary, plus whatever hours
                           are entered for the current week. */
                        if (that.HoursType != 'R' && that.HoursType != 'O') {
                            ko.utils.arrayForEach(parent.TimeOff(), function (timeOffItem) {
                                if (timeOffItem.HoursType === that.HoursType) {
                                    total += timeOffItem.Total() * 1;
                                }
                            });
                        }
                        else if (that.HoursType == 'O') {
                            total += parent.TotalOvertimeForWeek() * 1;
                        }
                        else {
                            total += parent.TotalRegularForDay(0) * 1;
                        }
                        return total + that.Hours();
                    },
                    owner: this,
                    deferEvaluation: true
                });
        }
    }

    var HourlyTimeOffHour = function (dto) {
        if (dto != null) {
            var mapping = {
                'copy': ["EmployeeHourlyId", "DayOfWeek", "HoursType", "DayDate", "InCurrentPeriod"]
            };

            ko.mapping.fromJS(dto, mapping, this);

            this.toJSON = function () {
                var copy = ko.toJS(this);
                delete copy.__ko_mapping__;
                delete copy.EmployeeHourlyId;
                delete copy.HoursType;
                delete copy.DayDate;
                delete copy.InCurrentPeriod;
                delete copy.DisplayDate;
                delete copy.IsDisabled;
                return copy;
            };

            this.DisplayDate = moment(dto.DayDate).format('ddd[<br/>]M/D');
            this.IsDisabled = !dto.InCurrentPeriod;
        }
    }

    var ApprovedDate = function (dto, parent) {
        if (dto != null) {
            var mapping = {
                'copy': ["SupervisorName"]
            };

            ko.mapping.fromJS(dto, mapping, this);
            
            this.ApprovalText = ko.computed(function () {
                if (this.DateApproved() != null) {
                    return "This time sheet was approved by " + this.SupervisorName + " at " + moment(this.DateApproved()).format('LLLL') + '.';
                }
                else {
                    return this.SupervisorName + " has not yet approved this time sheet.";
                }
            }, this);
        }
    }

    var model = {
        ImpersonableEmployee: ImpersonableEmployee,
        Tab: Tab,
        PageDetail: PageDetail,
        HourlyUnsubmitted: HourlyUnsubmitted,
        HourlyPartialForDropdown: HourlyPartialForDropdown,
        HourlyJob: HourlyJob,
        HourlyTimesheet: HourlyTimesheet
    };

    return model;

    function mapToObservable(dto) {
        var mapped = {};
        for (prop in dto) {
            if (dto.hasOwnProperty(prop)) {
                mapped[prop] = ko.observable(dto[prop]);
            }
        }
        return mapped;
    };
});