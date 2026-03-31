# Drone Ground Control Interface (SITL Integrated)

A web-based Ground Control Station (GCS) built with React that interfaces directly with an ArduPilot SITL simulation. This project provides a real-time, zero-refresh dashboard for monitoring telemetry and executing flight commands.

##  Setup & Installation

### Prerequisites
Ubuntu 22.04
ROS 2 Humble
Node.js (v14 or higher via NVM)
ArduPilot SITL & MAVROS

### 1. Install Dependencies
```bash
# Install the ROS 2 WebSocket Bridge
sudo apt install ros-humble-rosbridge-suite

# Install React dependencies
cd edhitha-gcs
npm install
```

### 2. Launching the System

To run the full simulation and interface, you must start four separate processes in this order:

# Terminal 1 (SITL): Launch the physics simulation on a dedicated port to avoid QGroundControl conflicts.
```sim_vehicle.py -v ArduCopter --console --map --out=127.0.0.1:14551
```
# Terminal 2 (MAVROS): Connect MAVROS to the dedicated port.
```ros2 launch mavros apm.launch fcu_url:=udp://127.0.0.1:14551@
```
# Terminal 3 (ROS Bridge): Start the WebSocket server.
```ros2 launch rosbridge_server rosbridge_websocket_launch.xml
```
# Terminal 4 (React App): Launch the frontend.
```cd edhitha-gcs
npm start
```
### 3. Architecture

To ensure clean separation of concerns, the codebase is strictly divided into three layers:

1. Data Layer (src/Telemetry.js): Exclusively handles network subscriptions to ROS 2 topics via
WebSockets.

2. Control Layer (src/Commands.js): Exclusively handles packaging user inputs into ROS 2 Service
Requests.

3. UI Layer (src/App.js): The container that manages the visual layout and renders the components.

### 4. System Flow

#Data Flow (SITL → UI)

This system achieves real-time telemetry without manual page refreshes.

    1. The SITL physics engine generates flight data and sends it to MAVROS via MAVLink.

    2. MAVROS publishes this data to standard ROS 2 topics (e.g., /mavros/global_position/rel_alt).

    3. rosbridge_server translates these topics into a continuous JSON stream over a WebSocket (port 9090).

    4. Inside the React App, a useEffect hook listens to this WebSocket. When new data arrives, it triggers a React useState update, forcing the DOM to instantly redraw only the updated telemetry values.

#Control Flow (UI → SITL)

    1. User Action: The user clicks a command button (e.g., "Guided Mode").

    2. API: roslibjs packages this request into a mavros_msgs/SetMode Service Call and sends it over the WebSocket.

    3. SITL Update: The bridge converts it into a native ROS 2 service call, passing it through MAVROS to the SITL, which executes the mode change.

    4. UI Response: The SITL sends a boolean success confirmation back through the pipeline. The React app catches this response and updates the "Command Status" UI text to confirm execution.
  
