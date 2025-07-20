#!/bin/bash
echo "Testing Excel upload with fixed unique constraint handling..."

# Check current product count
BEFORE_COUNT=$(curl -s "http://localhost:5000/api/products" | grep -o '"id":[0-9]*' | wc -l)
echo "Products before upload: $BEFORE_COUNT"

# Upload the Excel file
echo "Uploading Excel file..."
curl -X POST -F "excelFile=@attached_assets/House Of Clarence1_1752488521619.xlsx" \
     http://localhost:5000/api/upload-excel \
     -w "HTTP Status: %{http_code}\n" \
     2>/dev/null

# Wait for processing
sleep 5

# Check product count after upload
AFTER_COUNT=$(curl -s "http://localhost:5000/api/products" | grep -o '"id":[0-9]*' | wc -l)
echo "Products after upload: $AFTER_COUNT"

if [ "$AFTER_COUNT" -gt "$BEFORE_COUNT" ]; then
    echo "✅ Success! Added $(($AFTER_COUNT - $BEFORE_COUNT)) products"
else
    echo "❌ No new products added. Upload may have failed."
fi