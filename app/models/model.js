define(['knockout','knockout.mapping'],function (ko, komapping) {
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

            komapping.fromJS(dto, mapping, this);
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

            komapping.fromJS(dto, mapping, this);
        }
    }

    var Tab = function (dto) {
        if (dto != null) {
            var mapping = {                
            }

            komapping.fromJS(dto, mapping, this);
        }
    }   

    var model = {
        ImpersonableEmployee: ImpersonableEmployee,
        Tab: Tab,
        PageDetail: PageDetail,
        HourlyUnsubmitted: HourlyUnsubmitted,
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