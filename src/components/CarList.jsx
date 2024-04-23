import { Button, Snackbar } from "@mui/material";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import AddCar from "./AddCar";
import EditCar from "./EditCar";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef, useState } from "react"

export default function CarList() {

    // states
    const [cars, setCars] = useState([{ brand: '', model: '', color: '', fuel: '', year: '', price: '' }]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [msgSnackbar, setMgsSnackbar] = useState("");
    const URL = 'https://carrestservice-carshop.rahtiapp.fi/cars';

    /* coldefs original 
    const [colDefs, setColDefs] = useState([
        { field: 'brand' },
        { field: 'model' },
        {
            cellRenderer: (params) =>
                <Button
                    size="small"
                    color="warning"
                    onClick={() => deleteCar(params)}
                >Delete
                </Button>
            , width: 120
        }
    ])
    */

    const colums = [
        { headerName: 'Brand', field: 'brand', sortable: true, filter: true },
        { headerName: 'Model', field: 'model', sortable: true, filter: true },
        { headerName: 'Color', field: 'color', sortable: true, filter: true },
        { headerName: 'Fuel', field: 'fuel', sortable: true, filter: true },
        { cellRenderer: params => <EditCar updateCar={updateCar} params={params}/>, width: 120},
        {
            cellRenderer: (params) =>
                <Button size="small" color="error" onClick={() => deleteCar(params)}>
                    Delete
                </Button>,
            width: 120
        }
    ];

    useEffect(() => getCars(), []);       // fetch only after the first render

    // functions
    // getCars
    const getCars = () => {
        fetch(URL)
            .then(response => {
                console.log(response);
                return response.json();
            })
            .then(responsedata => {
                console.log(responsedata._embedded.cars);
                setCars(responsedata._embedded.cars);
            })
            .catch(error => console.error(error))
    }

    const gridRef = useRef();

    // deleteCar
    const deleteCar = (params) => {
        // console.log(params.data);
        console.log("params.data._links.car.href = " + params.data._links.car.href);
        if (window.confirm("Are you sure?")) {
            fetch(params.data._links.car.href, { method: 'DELETE' })
                .then(response => {
                    if (response.ok) {
                        // snackbar viesti
                        setMgsSnackbar("The car was deleted successfully!");
                        setOpenSnackbar(true);
                        getCars();    // haetaan pivittynyt autotilanne tietokannasta 
                    } else {
                        setMgsSnackbar("Something went wrong with deleting");
                        setOpenSnackbar(true);
                        //window.alert("Something went wrong with deleting");
                    }
                })
                .catch(error => console.error(error))
        }
    }

    // add car
    const addCar = (car) => {
        console.log("Carlist: addCar");
        fetch(URL, {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(car)
        })
            .then(response => {
                console.log("response" + response);
                if (response.ok) {
                    setMgsSnackbar('Auto lisätty onnistuneesti');
                    setOpenSnackbar(true);
                    return response.json;
                } else {
                    throw new Error('Datan vienti bakkariin ei onnistunut')
                }
            })
            .then(data => {
                console.log("parsed Json = " + data);
                getCars();
            })
    }

    const updateCar = (URL, updatedCar) => {
        console.log("Carlist: updatedCar");
        fetch(URL, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(updatedCar)
        })
            .then(response => {
                console.log("response" + response);
                if (response.ok) {
                    setMgsSnackbar('Auto PÄIVITETTY onnistuneesti');
                    setOpenSnackbar(true);
                    return response.json;
                } else {
                    throw new Error('Datan vienti bakkariin ei onnistunut')
                }
            })
            .then(data => {
                console.log("parsed Json = " + data);
                getCars();
            })
            .catch(error => console.error(error))
    }

    // return
    return (
        <>
            <AddCar addCar={addCar} />
            <div className="ag-theme-material" style={{ width: 1000, height: 500 }}>
                <AgGridReact
                    rowData={cars}
                    columnDefs={colums}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 30, 50]}
                    
                />
                <Snackbar
                    open={openSnackbar}
                    message={msgSnackbar}
                    autoHideDuration={3000}
                    onClose={() => {
                        setOpenSnackbar(false);
                        setMgsSnackbar("")
                    }}
                />
            </div>
        </>
    )
}