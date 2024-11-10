# Geospatial Query System

A high-performance spatial data indexing and querying system built using R-trees, designed for efficient geographic point data management and spatial queries.

## Features

- Spatial Indexing: Implements R-tree data structure for efficient spatial data organization
- Real-time Operations: Supports concurrent access with thread-safe operations
- RESTful API: Provides HTTP endpoints for various spatial operations
- Query Operations:
  - Point insertion
  - Nearest neighbor search
  - Range queries
  - Polygon intersection queries

## Technical Stack

- Backend: C++ with Crow framework for REST API
- Data Structure: Custom R-tree implementation
- Concurrency: Thread-safe operations using mutex locks
- JSON Processing: nlohmann/json library for data handling


## Setup and Installation

  ### 1. Prerequisites
     - C++ compiler with C++11 support (GCC 4.8+ or Clang 3.4+)
     - CMake (3.8 or higher)
     - Boost library (for Asio)
     - OpenSSL development files (optional, for HTTPS support)
     - nlohmann/json library

  ### 2. Installing Dependencies

  #### Ubuntu/Debian
```bash
# Install essential build tools
sudo apt-get update
sudo apt-get install build-essential cmake

# Install Boost libraries
sudo apt-get install libboost-all-dev

# Install OpenSSL (optional, for HTTPS support)
sudo apt-get install libssl-dev

# Install nlohmann/json
sudo apt-get install nlohmann-json3-dev
```

#### macOS
```bash
# Install build tools
xcode-select --install

# Install homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install cmake
brew install boost
brew install openssl
brew install nlohmann-json
```

#### Windows
1. Install Visual Studio with C++ development tools
2. Install vcpkg package manager:
```bash
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
bootstrap-vcpkg.bat
vcpkg integrate install

# Install dependencies
vcpkg install boost:x64-windows
vcpkg install openssl:x64-windows
vcpkg install nlohmann-json:x64-windows
```

###3. Installing Crow Framework

#### Method 1: Building from Source
```bash
# Clone Crow repository
git clone https://github.com/CrowCpp/Crow.git
cd Crow

# Create and enter build directory
mkdir build
cd build

# Configure and build
cmake ..
make
sudo make install
```

### 4. Project Build Instructions

```bash
# Clone the repository
git clone [repository-url]

# Navigate to project directory
cd geospatial-query-system

# Create and enter build directory
mkdir build
cd build

# Configure and build
cmake ..
make
```

### 5. CMake Configuration

Create a `CMakeLists.txt` file in your project root:

```cmake
cmake_minimum_required(VERSION 3.8)
project(GeospatialQuerySystem)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find required packages
find_package(Boost REQUIRED COMPONENTS system)
find_package(OpenSSL REQUIRED)
find_package(nlohmann_json REQUIRED)

# Add executable
add_executable(server server.cpp)

# Include directories
target_include_directories(server PRIVATE 
    ${Boost_INCLUDE_DIRS}
    ${OPENSSL_INCLUDE_DIR}
    include
)

# Link libraries
target_link_libraries(server PRIVATE
    ${Boost_LIBRARIES}
    ${OPENSSL_LIBRARIES}
    pthread
    nlohmann_json::nlohmann_json
)
```

### 6. Running the Server

```bash
# Run the server
./server
```

The server will start on port 3000 by default.


## Implementation Details

### R-tree Structure
- Maximum entries per node: 4
- Minimum entries per node: 2
- Supports dynamic insertion and deletion
- Auto-adjusting minimum bounding rectangles (MBRs)

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful operation
- 400: Invalid input data or malformed JSON
- 500: Internal server error


## Limitations

- Currently supports 2D spatial data only
- Fixed maximum node capacity
- In-memory storage (no persistence)


## Contact

Meet Tilala
meettilala2005@gmail.com
