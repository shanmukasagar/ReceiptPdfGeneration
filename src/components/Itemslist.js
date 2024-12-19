import React, {useState, useEffect} from 'react';
import { Box, TextField, Button, Typography } from "@mui/material";
import axios from 'axios';

const Itemslist = () => {

    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedItems, setSelectedItems] = useState({});
    const itemsList = { "Idly - 2" : 30, "Dosa - 1" : 45, "Vada - 3" : 40, "Chapathi - 2" : 40, "Parota - 2" : 50, "Water Bottle - 1" : "20", "Cool Drink - 1" : 20};

    useEffect(() => {
        let price = 0;
        for(const item of Object.keys(selectedItems)) {
            price += itemsList[item] * selectedItems[item];
        }
        setTotalAmount(price);

    },[selectedItems])

    const handleChange = (e) => {
        const {name, value} = e.target;
        if(value === "") {
            setSelectedItems((prevState) => ({...prevState, [name] : value}));
            return;
        }
        if(Number(value) > 0) {
            setSelectedItems((prevState) => ({...prevState, [name] : value}));
            return;
        }
    }
    const formatToAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 0, 
          maximumFractionDigits: 0, 
        }).format(amount);
      }

    const handleSubmit = async(e) => {
        const choosenItems = {};
        for(const item of Object.keys(selectedItems)) {
            if(Number(selectedItems[item]) > 0) {
                choosenItems[item] = selectedItems[item];
            }
        }
        if(Object.keys(choosenItems).length <= 0) {
            return;
        }
        
        const neededData = { choosenItems :  choosenItems, allItems : itemsList, amount : totalAmount};
        try{
            axios.post("http://localhost:5010/api/receipt", neededData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'application/json'}}).then(response => {
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'receipt.pdf');
                    document.body.appendChild(link);
                    link.click();
                    link.remove(); // Clean up
                    setTotalAmount(0);
                    setSelectedItems({});
            })
            .catch(error => {
                console.log("Error occured while downloading receipt");
            });
        }
        catch(error) {
            console.log("Error Occured on reciept generation");
        }
    }

    return (
        <Box className = "items-main">
            <Box className = "panel-main">
                <Box className = "panel-style">
                    <Box className = "sub-panel-style">
                        <Box className = "title">Sabarinadh Hotel</Box>
                        <Box className = "items-list-main">
                            <Box className = "sub-items-list">
                                <Typography className = "item-name name-size name-color">Items</Typography>
                                <Typography className = "item-name short-size name-color">Prices</Typography>
                                <Typography className = "item-name name-color">Quantity</Typography>
                            </Box>
                            {Object.keys(itemsList).map((item, index) => (
                                <Box className = "sub-items-list">
                                    <Typography className = "item-name name-size">{` ${item}`}</Typography>
                                    <Typography className="item-name short-size">{`₹ ${itemsList[item]}`}</Typography>
                                    <TextField className = "quantity" name = {item} value = {selectedItems[item] || ""} onChange = {handleChange}></TextField>
                                </Box>
                            ))}
                        </Box>
                        <Box className = "total-amount-main">
                            <Box className = "total-color">Total : </Box>
                            <Box className = "amount">{formatToAmount(totalAmount)}</Box>
                        </Box>
                        <Button className = "pay-button" onClick = {handleSubmit}>Pay</Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default Itemslist