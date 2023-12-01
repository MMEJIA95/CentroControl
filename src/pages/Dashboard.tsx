import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableHead, TableBody, TableRow, TableCell, Paper, Typography, Select, MenuItem, InputLabel, SelectChangeEvent, Button } from '@mui/material';
import DatetimeComponent from '../components/datetime';
import sedesData from '../assets/sedes.json'
import { format, parseISO } from 'date-fns';

interface ApiData {
    id: string,
    fechaRegistro: string;
    numeroDocumento: string;
    nombres: string;
    cargo: string;
    turno: string;
    horaInicio: string;
    horaFin: string;
    ceco: string;
}
interface SedeOptions {
    '10': string[];
}
const Dashboard = () => {
    const [tableData, setTableData] = useState<ApiData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [empresa, setEmpresa] = React.useState('10');
    const [sedeEmpresa, setSedeEmpresa] = React.useState('5db40118-88ad-11ee-a934-1666092c277b');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedDateFin, setSelectedDateFin] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async (formattedDate: string | null, formattedDateFin: string | null) => {
        try {
            setIsLoading(true);
            const response = await axios.post('https://k2-app-supervision-commands.azurewebsites.net/api/Tareo/Post_CentroControl_Pizarra_Tareo', {
                fechaInicio: formattedDate,
                fechaFin: formattedDateFin,
                idClienteEmpresa: '51062251-2bac-4d3b-8ace-7be66f2c45b7',
                idClienteSede: sedeEmpresa,
            });

            console.log("data de empresa seleccionada", formattedDate, formattedDateFin);

            // console.log('Respuesta de la API:', response);

            setTableData(response.data.valueData);
        } catch (error) {
            console.error('Error al obtener datos de la API', error);
            setError('Error al obtener datos de la API. Por favor, inténtelo de nuevo.');
        }
    };


    useEffect(() => {
        if (selectedDate && selectedDateFin) {
            const fechaISO = selectedDate.toISOString();
            const fecha = parseISO(fechaISO);
            const formattedDate = fecha ? format(fecha, 'yyyy-MM-dd') : null;

            const fechaISOFin = selectedDateFin.toISOString();
            const fechaFin = parseISO(fechaISOFin);
            const formattedDateFin = fechaFin ? format(fechaFin, 'yyyy-MM-dd') : null;

            fetchData(formattedDate, formattedDateFin);
            console.log('Fecha formateada:', formattedDate);
            console.log('Fecha de fin formateada:', formattedDateFin);
        } else {
            console.log('Fecha seleccionada o fecha de fin es nula.');
            // Puedes manejar el caso cuando una de las fechas es nula, si es necesario
        }
    }, [sedeEmpresa, selectedDate, selectedDateFin]);


    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedEmpresa = event.target.value as string;
        setEmpresa(selectedEmpresa);

        // Actualiza las opciones de la sede según la empresa seleccionada
        const defaultSede = sedeOptions[selectedEmpresa][0]; // Obtiene la primera sede
        setSedeEmpresa(defaultSede); // Establece la primera sede por defecto
    };

    const handleChangeSede = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSedeEmpresa(event.target.value as string);
    };

    const processedSedes = sedesData.reduce((acc, sede) => {
        acc[sede.idClienteSede] = sede.sedeNombre;
        return acc;
    }, {} as Record<string, string>);

    const sedeOptions: SedeOptions = {
        '10': Object.values(processedSedes)
    };

    const handleDateChange = (date: Date | null) => {
        setSelectedDate(date);

        if (date) {
            const fechaISO = date.toISOString();
            const fecha = parseISO(fechaISO);
            const formattedDate = fecha ? format(fecha, 'yyyy-MM-dd') : null;
            console.log('Fecha formateada:', formattedDate);
            fetchData(formattedDate, '');
        } else {
            console.log('Fecha seleccionada es nula.');

        }
    };

    const handleDateFinChange = (date: Date | null) => {
        setSelectedDateFin(date);

        if (date) {
            const fechaISOFin = date.toISOString();
            const fechaFin = parseISO(fechaISOFin);
            const formattedDateFin = fechaFin ? format(fechaFin, 'yyyy-MM-dd') : null;
            console.log('Fecha fin formateada:', formattedDateFin);
            fetchData(selectedDate, selectedDateFin);
        } else {
            console.log('Fecha de fin seleccionada es nula.');
            // Puedes manejar el caso cuando la fecha de fin es nula, si es necesario
        }
    };

    const getColor = (fechaRegistro: string, horaInicio: string): string => {
        const fechaRegistroDate = new Date(fechaRegistro);
        const horaInicioDate = new Date(horaInicio);

      
        const diffInMinutes = (fechaRegistroDate.getTime() - horaInicioDate.getTime()) / (1000 * 60);        
        console.log( format(fechaRegistroDate,'00:00:00'),horaInicio);
        
        if (diffInMinutes <= 10) {
            return 'green';
        } else if (diffInMinutes <= 11) {
            return 'yellow';
        } else {
            return 'black'; // Puedes ajustar esto según tus necesidades
        }
    };


    { isLoading && <p>Cargando...</p> }
    return (
        <>
            <Paper elevation={3} style={{ margin: '20px', padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Typography>
                            Desde:
                        </Typography>
                        <DatetimeComponent
                            value={selectedDate}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div>
                        <Typography>
                            Hasta:
                        </Typography>
                        <DatetimeComponent
                            value={selectedDateFin}
                            onChange={handleDateFinChange}
                        />
                    </div>
                    <div>
                        <InputLabel id="empresa-label">Empresa</InputLabel>
                        <Select
                            labelId="empresa-label"
                            id="empresa-select"
                            value={empresa}
                            label="Empresa"
                            onChange={handleChange}
                        >
                            <MenuItem value={10}>Mission Produce</MenuItem>
                        </Select>
                    </div>
                    <div>
                        <InputLabel id="sede-label">Sede</InputLabel>
                        <Select
                            labelId="sede-label"
                            id="sede-select"
                            value={sedeEmpresa}
                            label="Sede"
                            onChange={handleChangeSede}
                        >
                            {Object.keys(processedSedes).map((sedeId) => (
                                <MenuItem key={sedeId} value={sedeId}>
                                    {processedSedes[sedeId]}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>
                    {/* <div>
                        <Button style={{ background: '#14A7A7', color: '#fff' }} onClick={handlePress}>Buscar</Button>
                    </div> */}
                </div>
            </Paper>



            <Paper elevation={3} style={{ margin: '20px', padding: '20px' }}>
                {tableData.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha de Asistencia Real</TableCell>
                                <TableCell>DNI</TableCell>
                                <TableCell>Nombres</TableCell>
                                <TableCell>Cargo</TableCell>
                                <TableCell>Turno</TableCell>
                                <TableCell>Hora de Inicio</TableCell>
                                <TableCell>Hora de Fin</TableCell>
                                <TableCell>CECO</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.fechaRegistro}</TableCell>
                                    <TableCell>{row.numeroDocumento}</TableCell>
                                    <TableCell>{row.nombres}</TableCell>
                                    <TableCell>{row.cargo}</TableCell>
                                    <TableCell>{row.turno}</TableCell>
                                    <TableCell style={{ color: getColor(row.fechaRegistro, row.horaInicio) }}>{row.horaInicio}</TableCell>
                                    <TableCell style={{ color: getColor(row.fechaRegistro, row.horaInicio) }}>{row.horaFin}</TableCell>
                                    <TableCell>{row.ceco}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <Typography variant="subtitle1" align="center" style={{ marginTop: '20px', fontStyle: 'italic', color: '#888' }}>
                        No hay datos disponibles
                    </Typography>
                )}
                {error && <Typography variant="body1" color="error" style={{ marginTop: '20px' }}>{error}</Typography>}
            </Paper>
        </>
    );
};



export default Dashboard;