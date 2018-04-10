import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as RidesState from '../store/Rides';
import * as RideActions from '../actions/_RideActions';
import * as RideStatusActions from '../actions/_RideStatusActions';
import * as RideTypeActions from '../actions/_RideTypeActions';
import * as moment from 'moment'

import RideForm from './forms/RideForm';

import ReactTable from 'react-table';

// combines action creators from ride, ridestatus, and ridetype
const actionCreators = Object.assign(
    RideActions.actionCreators, 
    RideStatusActions.actionCreators, 
    RideTypeActions.actionCreators);

// At runtime, Redux will merge together...
type DataProps =
    RidesState.RidesState        // ... state we've requested from the Redux store
    & typeof actionCreators    // ... plus action creators we've requested
    & RouteComponentProps<{ entity: string }>; // ... plus incoming routing parameters

class Rides extends React.Component<DataProps, {}> {
    componentDidMount() {
        // This method runs when the component is first added to the page
        this.props.requestRideStatusList();
        this.props.requestRideTypeList();
        this.props.requestRidesList();
    }

    componentDidUpdate(prevProps: DataProps) {
        // This method runs when incoming props (e.g., route params) change
        if (!this.props.loadingRideList && this.props.reloadRides) 
            this.props.requestRidesList();
    }

    render() {
        return <div>
            <h3>Add Ride</h3>
            { this.renderCreateNewForm() }
            <h1>Ride Table</h1>
            { (!this.props.loadingRideList) ? this.renderRidesTable() : 
                <h3>LOADING TABLE...</h3>}
        </div>
    }

    createNewRide = values => {
        this.props.createNewRide(values);
    }

    updateRide = values => {
        this.props.updateRide(values);
    }

    deleteRide(id) {
        this.props.deleteRide(id);
    }

    // lookup ride status by id from rideStatusList prop
    private lookupRideStatus(id) {
        const rsl = this.props.rideStatusList;

        if (typeof rsl !== 'undefined' && rsl.length > 0) {
            for (var i = 0; i < rsl.length; i++) {
                if (id == rsl[i].rideStatusId) {
                    return rsl[i].rideStatus;
                }
            }
            return "Unknown";
        }
    }

    // generate select element from rideStatusList prop
    private lookupRideStatusFilter(filter, onChange) {
        const rsl = this.props.rideStatusList;

        if (typeof rsl !== 'undefined' && rsl.length > 0) {
            return <select
                onChange={event => onChange(event.target.value)}
                style={{ width: "100%" }}
                value={filter ? filter.value : "all"}
            >
                <option value="all">Show All</option>
                {rsl.map((rs, i) => 
                    <option value={rsl[i].rideStatusId}
                        key={i}>
                        {rsl[i].rideStatus}
                    </option>
                )}
            </select>
        }
    }

    // lookup ride type by id from rideStatusType prop
    private lookupRideType(id) {
        const rtl = this.props.rideTypeList;

        if (typeof rtl !== 'undefined' && rtl.length > 0) {
            for (var i = 0; i < rtl.length; i++) {
                if (id == rtl[i].rideTypeId) {
                    return rtl[i].rideType;
                }
            }
            return "Unknown";
        }
    }

    // generate select element from rideTypeList prop
    private lookupRideTypeFilter(filter, onChange) {
        const rtl = this.props.rideTypeList;

        if (typeof rtl !== 'undefined' && rtl.length > 0) {
            return <select
                onChange={event => onChange(event.target.value)}
                style={{ width: "100%" }}
                value={filter ? filter.value : "all"}
            >
                <option value="all">Show All</option>
                {rtl.map((rs, i) => 
                    <option value={rtl[i].rideTypeId}
                        key={i}>
                        {rtl[i].rideType}
                    </option>
                )}
            </select>
        }
    }

    private renderCreateNewForm() {        
        return <RideForm 
            onSubmit={this.createNewRide}
            form="newForm"
            props={{
                rideStatusList: this.props.rideStatusList,
                rideTypeList: this.props.rideTypeList
            }}
        />
    }

    private renderRidesTable() {
        return <div>
            <ReactTable 
                data={this.props.rideList}
                columns={[
                    {
                        Header: "Ride Name",
                        accessor: "rideName"
                    },
                    {
                        Header: "Total Capacity",
                        accessor: "totalCapacity",
                        filterable: false
                    },
                    {
                        Header: "Installation Date",
                        accessor: "installationDate",
                        filterable: false,
                        Cell: row => (
                            // convert dateString to Date object and convert it back to string
                            moment(new Date(row.value)).format('YYYY-MM-DD')
                        )
                    },
                    {
                        Header: "Ride Status",
                        accessor: "status",
                        Cell: row => (
                            this.lookupRideStatus(row.value)
                        ),
                        Filter: ({ filter, onChange }) =>
                            this.lookupRideStatusFilter(filter, onChange),
                        filterMethod: (filter, row) => {
                            if (filter.value == "all") {
                                return true;
                            }
                            return row.status == filter.value;
                        },
                          
                    },
                    {
                        Header: "FastPassPossible",
                        accessor: "fastPassPossible",
                        Cell: row => (
                            row.value === false ? 'no'
                            : row.value === true ? 'yes'
                            : 'Unknown'
                        ),
                        filterable: false
                    },
                    {
                        Header: "Ride Type",
                        accessor: "rideType",
                        Cell: row => (
                            this.lookupRideType(row.value)
                        ),
                        Filter: ({ filter, onChange }) =>
                            this.lookupRideTypeFilter(filter, onChange),
                        filterMethod: (filter, row) => {
                            if (filter.value == "all") {
                                return true;
                            }
                            return row.rideType == filter.value;
                        },
                    }
                ]}
                className="-striped -highlight"
                filterable
                SubComponent={row => {
                    const { original } = row;
                    // contains update form
                    return (
                    <div className="container" style={{ width: "100%" }}>
                        <RideForm 
                            onSubmit={this.updateRide}
                            initialValues={original}
                            form={"form"+original.rideId}
                            props={{
                                rideStatusList: this.props.rideStatusList,
                                rideTypeList: this.props.rideTypeList
                            }}
                        />
                        <button onClick={this.deleteRide.bind(this, original) } >
                            Delete
                        </button>
                    </div>
                    );
                }}
            />
        </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.rides, // Selects which state properties are merged into the component's props
    actionCreators                 // Selects which action creators are merged into the component's props
)(Rides) as typeof Rides;