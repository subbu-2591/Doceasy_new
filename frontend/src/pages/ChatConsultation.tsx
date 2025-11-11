import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { useToast } from "../hooks/use-toast";
import { API_URL } from "../config";
import CryptoJS from "crypto-js";

// UI Components
import {
  Loader2,
  Send,
  Image as ImageIcon,
  File,
  Info,
  ArrowLeft,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Paperclip
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";

interface ChatMessage {
  id: string;
  appointment_id: string;
  sender_id: string;
  sender_type: 'doctor' | 'patient';
  encrypted_content: string;
  content_type: 'text' | 'image' | 'file';
  file_metadata?: {
    file_name?: string;
    file_size?: number;
    file_type?: string;
    file_url?: string;
  };
  read_by_recipient: boolean;
  created_at: string;
  message_hash: string;
}

interface Appointment {
  id: string;
  doctor_id: string;
  doctor_name: string;
  patient_id: string;
  patient_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  consultation_type: string;
  urgent?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_picture?: string;
}

const ChatConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatKey, setChatKey] = useState<string>("");
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [showCreateOption, setShowCreateOption] = useState<boolean>(false);

  // Generate a secure chat key from appointment ID (in a real app, this would be more secure)
  useEffect(() => {
    if (appointmentId) {
      // In a real app, this key would be exchanged securely between participants
      // This is just a simple demo implementation
      const key = CryptoJS.SHA256(`secure-chat-${appointmentId}`).toString().substring(0, 32);
      setChatKey(key);
    }
  }, [appointmentId]);

  // Fetch appointment details and messages
  useEffect(() => {
    const fetchData = async () => {
      if (!appointmentId) {
        setError("Invalid appointment ID");
        setLoading(false);
        return;
      }

      // Validate appointment ID format (MongoDB ObjectId is 24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(appointmentId);
      if (!isValidObjectId) {
        setError("Invalid appointment ID format");
        setDebugInfo(`Appointment ID ${appointmentId} is not a valid format`);
        setLoading(false);
        return;
      }

      try {
        // Get current user info
        const userResponse = await axios.get(`${API_URL}/api/auth/validate-session`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        if (userResponse.data && userResponse.data.user) {
          setCurrentUser(userResponse.data.user);
        } else {
          navigate("/login/patient");
          return;
        }

        // First try to get appointment details
        let appointmentData;
        try {
          // Get appointment details
          const appointmentResponse = await axios.get(`${API_URL}/api/consultations/join/${appointmentId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          // Log the response for debugging
          console.log("Appointment API response:", appointmentResponse.data);
          
          if (appointmentResponse.data) {
            // The API returns the consultation data directly, not nested under 'appointment'
            appointmentData = {
              id: appointmentId,
              doctor_id: appointmentResponse.data.doctor_id,
              doctor_name: appointmentResponse.data.doctor_name || "Doctor",
              patient_id: appointmentResponse.data.patient_id,
              patient_name: appointmentResponse.data.patient_name || "Patient",
              appointment_date: appointmentResponse.data.scheduled_time || appointmentResponse.data.appointment_date,
              appointment_time: new Date(appointmentResponse.data.scheduled_time || appointmentResponse.data.appointment_date).toLocaleTimeString(),
              status: "confirmed",
              consultation_type: appointmentResponse.data.consultation_type,
              urgent: appointmentResponse.data.is_immediate || appointmentResponse.data.urgent
            };
          }
        } catch (error: any) {
          console.log("Error fetching consultation, trying to get appointment directly:", error);
          
          // If consultation join fails, try to get the appointment directly
          if (error.response && error.response.status === 404) {
            // Try to get the appointment directly from appointments API
            try {
              const directAppointmentResponse = await axios.get(`${API_URL}/api/appointments/${appointmentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
              });
              
              if (directAppointmentResponse.data && directAppointmentResponse.data.appointment) {
                appointmentData = directAppointmentResponse.data.appointment;
              } else {
                // Show create option if the appointment doesn't exist
                setShowCreateOption(true);
                setError("Chat consultation not found");
                setDebugInfo(`The chat consultation with ID ${appointmentId} does not exist. You can create a new one.`);
                setLoading(false);
                return;
              }
            } catch (appointmentError) {
              console.error("Error fetching direct appointment:", appointmentError);
              // Show create option if the appointment doesn't exist
              setShowCreateOption(true);
              setError("Chat consultation not found");
              setDebugInfo(`Unable to find a chat consultation with ID: ${appointmentId}`);
              setLoading(false);
              return;
            }
          } else {
            throw error; // Re-throw if it's not a 404
          }
        }

        if (!appointmentData) {
          // Show create option if the appointment doesn't exist
          setShowCreateOption(true);
          setError("Chat consultation data could not be retrieved");
          setDebugInfo(`Could not get chat consultation data for ID: ${appointmentId}`);
          setLoading(false);
          return;
        }
        
        // Check if this is a chat consultation
        if (appointmentData.consultation_type !== "chat") {
          setError("This is not a chat consultation");
          setLoading(false);
          return;
        }

        // Check if appointment is confirmed
        if (appointmentData.status !== "confirmed") {
          setError("This appointment is not confirmed yet");
          setLoading(false);
          return;
        }
        
        // Check if appointment time is valid (unless it's urgent)
        const now = new Date();
        const appointmentTime = new Date(appointmentData.appointment_date);
        const fiveMinutesBefore = new Date(appointmentTime.getTime() - 5 * 60 * 1000);
        
        // If it's not an urgent consultation and the appointment time is more than 5 minutes in the future
        if (!appointmentData.urgent && now < fiveMinutesBefore) {
          const timeUntil = Math.ceil((fiveMinutesBefore.getTime() - now.getTime()) / (60 * 1000));
          setError(`Your consultation will be available in ${timeUntil} minutes`);
          setLoading(false);
          return;
        }

        setAppointment(appointmentData);

        // Get chat messages
        try {
          const messagesResponse = await axios.get(`${API_URL}/api/chat/messages/${appointmentId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });

          if (messagesResponse.data && messagesResponse.data.messages) {
            setMessages(messagesResponse.data.messages);
          }
        } catch (messagesError) {
          console.error("Error fetching messages:", messagesError);
          // Don't fail the whole chat if just messages fail to load
          // We'll show an empty chat and let them send new messages
        }

        setLoading(false);
      } catch (error: any) {
        console.error("Error fetching chat data:", error);
        
        // Improved error handling with more detailed information
        let errorMessage = "Failed to load chat. Please try again later.";
        let debugDetails = null;
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
          debugDetails = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`;
          console.error("Error response:", error.response);
          
          // Show create option for 404 errors
          if (error.response.status === 404) {
            setShowCreateOption(true);
            errorMessage = "Chat consultation not found";
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = "No response from server. Please check your connection.";
          debugDetails = "Request was sent but no response received";
        } else {
          // Something happened in setting up the request that triggered an Error
          errorMessage = error.message || "Unknown error occurred";
          debugDetails = error.toString();
        }
        
        setError(errorMessage);
        setDebugInfo(debugDetails);
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!appointmentId || loading || error) return;

    let failedAttempts = 0;
    const MAX_FAILED_ATTEMPTS = 3;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/chat/messages/${appointmentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        // Reset failed attempts on success
        failedAttempts = 0;

        if (response.data && response.data.messages) {
          // Only update if there are new messages
          if (response.data.messages.length > messages.length) {
            setMessages(response.data.messages);
            
            // Mark new messages as read
            const newMessages = response.data.messages.filter(
              (msg: ChatMessage) => 
                !messages.some(existingMsg => existingMsg.id === msg.id) && 
                msg.sender_id !== currentUser?.id && 
                !msg.read_by_recipient
            );
            
            newMessages.forEach((msg: ChatMessage) => {
              markMessageAsRead(msg.id);
            });
          }
        }
      } catch (error: any) {
        console.error("Error polling messages:", error);
        failedAttempts++;
        
        // If too many failures, stop polling and show a toast
        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
          clearInterval(interval);
          toast({
            title: "Connection issue",
            description: "Unable to get new messages. Please refresh the page.",
            variant: "destructive"
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [appointmentId, messages, currentUser, loading, error, toast]);

  // Encrypt message content
  const encryptMessage = (content: string): string => {
    if (!chatKey) return content;
    return CryptoJS.AES.encrypt(content, chatKey).toString();
  };

  // Decrypt message content
  const decryptMessage = (encryptedContent: string): string => {
    if (!chatKey) return encryptedContent;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedContent, chatKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Error decrypting message:", error);
      return "[Encrypted message]";
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId: string) => {
    try {
      await axios.post(
        `${API_URL}/api/chat/messages/${messageId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !appointmentId || !currentUser) return;

    setSending(true);
    try {
      // Encrypt the message content
      const encryptedContent = encryptMessage(newMessage.trim());

      const response = await axios.post(
        `${API_URL}/api/chat/messages`,
        {
          appointment_id: appointmentId,
          encrypted_content: encryptedContent,
          content_type: "text"
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      if (response.data && response.data.success) {
        // Add the new message to the list
        setMessages([...messages, response.data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !appointmentId || !currentUser) return;

    setUploadingFile(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("appointment_id", appointmentId);

      // Upload file
      const uploadResponse = await axios.post(
        `${API_URL}/api/chat/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (uploadResponse.data && uploadResponse.data.success) {
        // Create file metadata
        const fileMetadata = {
          file_name: uploadResponse.data.file_name,
          file_size: uploadResponse.data.file_size,
          file_type: uploadResponse.data.file_type,
          file_url: uploadResponse.data.file_url
        };

        // Encrypt file metadata
        const encryptedContent = encryptMessage(
          JSON.stringify({ type: "file", metadata: fileMetadata })
        );

        // Send message with file reference
        const messageResponse = await axios.post(
          `${API_URL}/api/chat/messages`,
          {
            appointment_id: appointmentId,
            encrypted_content: encryptedContent,
            content_type: "file",
            file_metadata: fileMetadata
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );

        if (messageResponse.data && messageResponse.data.success) {
          setMessages([...messages, messageResponse.data.message]);
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Failed to upload file",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    try {
      const decryptedContent = decryptMessage(message.encrypted_content);
      
      if (message.content_type === "text") {
        return <p className="whitespace-pre-wrap">{decryptedContent}</p>;
      } else if (message.content_type === "file") {
        // For files, try to parse the JSON content
        const fileData = JSON.parse(decryptedContent);
        const metadata = fileData.metadata || message.file_metadata;
        
        if (!metadata) return <p>File attachment (unavailable)</p>;
        
        const isImage = metadata.file_type?.startsWith("image/");
        
        return (
          <div>
            {isImage ? (
              <div className="mt-2">
                <img 
                  src={`${API_URL}${metadata.file_url}`} 
                  alt={metadata.file_name || "Image"} 
                  className="max-w-[200px] max-h-[200px] rounded-md object-cover"
                />
                <p className="text-xs mt-1 text-gray-500">{metadata.file_name}</p>
              </div>
            ) : (
              <a 
                href={`${API_URL}${metadata.file_url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <File className="h-5 w-5" />
                <div>
                  <p className="text-sm font-medium">{metadata.file_name}</p>
                  <p className="text-xs text-gray-500">
                    {(metadata.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </a>
            )}
          </div>
        );
      }
      
      return <p>Unsupported message type</p>;
    } catch (error) {
      console.error("Error rendering message:", error);
      return <p className="text-red-500">Error displaying message</p>;
    }
  };

  // Create a new chat consultation
  const createChatConsultation = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to create a chat consultation",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create a new appointment with chat consultation type
      const response = await axios.post(
        `${API_URL}/api/appointments`,
        {
          doctor_id: appointmentId, // Using the ID from URL as doctor ID
          consultation_type: "chat",
          appointment_date: new Date().toISOString(),
          urgent: true,
          notes: "Auto-created chat consultation"
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      if (response.data && response.data.appointment_id) {
        // Navigate to the new chat consultation
        toast({
          title: "Success",
          description: "Chat consultation created successfully",
        });
        navigate(`/chat/${response.data.appointment_id}`);
      } else {
        setError("Failed to create chat consultation");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error creating chat consultation:", error);
      setError("Failed to create chat consultation");
      setDebugInfo(JSON.stringify(error.response?.data || error.message));
      setLoading(false);
    }
  };

  // Handle retry loading appointment
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setDebugInfo(null);
    setShowCreateOption(false);
    // Re-run the effect to fetch appointment data
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-medical-blue mb-4" />
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        {/* Debug information for development purposes */}
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <Alert variant="default" className="max-w-md mt-4">
            <AlertTitle>Debug Info</AlertTitle>
            <AlertDescription className="text-xs overflow-auto max-h-32">
              {debugInfo}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4 flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleRetry}
          >
            <Loader2 className="h-4 w-4 mr-2" />
            Retry
          </Button>
          
          {showCreateOption && currentUser && (
            <Button 
              variant="default" 
              onClick={createChatConsultation}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Create New Chat
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-medical-blue" />
                Chat Consultation
                {appointment?.urgent && (
                  <Badge variant="destructive" className="ml-2">Urgent</Badge>
                )}
              </h1>
              {appointment && (
                <p className="text-sm text-gray-500">
                  {appointment.consultation_type === "chat" ? "Secure Chat" : appointment.consultation_type}
                </p>
              )}
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4 mr-2" />
                  Info
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium">End-to-End Encrypted Chat</p>
                <p className="text-xs mt-1">
                  Messages are encrypted and can only be read by you and the other participant.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row gap-6 flex-1">
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Chat header */}
          <div className="p-4 border-b bg-gray-50">
            {appointment && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={currentUser?.role === 'patient' 
                        ? `${API_URL}/api/uploads/profile_pictures/profile_${appointment.doctor_id}_profile.jpg` 
                        : `${API_URL}/api/uploads/profile_pictures/profile_${appointment.patient_id}_profile.jpg`} 
                    />
                    <AvatarFallback>
                      {currentUser?.role === 'patient' 
                        ? appointment.doctor_name.charAt(0)
                        : appointment.patient_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">
                      {currentUser?.role === 'patient' 
                        ? `Dr. ${appointment.doctor_name}`
                        : appointment.patient_name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant="outline" className="text-xs">
                        {appointment.status}
                      </Badge>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(appointment.appointment_date), 'MMM d, yyyy')} at {appointment.appointment_time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle className="h-12 w-12 mb-2 opacity-20" />
                <p className="text-center">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = message.sender_id === currentUser?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isCurrentUser
                          ? 'bg-medical-blue text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {renderMessageContent(message)}
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        <span>
                          {format(new Date(message.created_at), 'h:mm a')}
                        </span>
                        {isCurrentUser && (
                          <span>
                            {message.read_by_recipient ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
              >
                {uploadingFile ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 min-h-[40px] max-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                type="button"
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Consultation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointment && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="font-medium">
                      {format(new Date(appointment.appointment_date), 'MMMM d, yyyy')} at {appointment.appointment_time}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      {currentUser?.role === 'patient' ? 'Doctor' : 'Patient'}
                    </h3>
                    <p className="font-medium">
                      {currentUser?.role === 'patient' 
                        ? `Dr. ${appointment.doctor_name}` 
                        : appointment.patient_name}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'outline'}>
                      {appointment.status}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>End-to-End Encrypted</AlertTitle>
            <AlertDescription>
              Your messages are encrypted and can only be read by you and the other participant.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default ChatConsultation;
