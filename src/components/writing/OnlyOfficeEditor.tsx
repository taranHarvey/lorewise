'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, useCallback } from 'react';

interface OnlyOfficeEditorProps {
  documentId: string;
  documentTitle?: string;
  onSave?: (content: string) => void;
  onError?: (error: string) => void;
  height?: string;
  width?: string;
}

// Export a ref interface for external use
export interface OnlyOfficeEditorRef {
  forceSave: () => Promise<void>;
}

const OnlyOfficeEditor = React.forwardRef<OnlyOfficeEditorRef, OnlyOfficeEditorProps>(({
  documentId,
  documentTitle = 'Novel Document',
  onSave,
  onError,
  height = '100vh',
  width = '100%'
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docEditor, setDocEditor] = useState<any>(null);
  const docEditorRef = useRef<any>(null); // Keep DocEditor accessible
  const initializationAttempted = useRef<boolean>(false);
  const scriptLoaded = useRef<boolean>(false);
  const [isDestroying, setIsDestroying] = useState<boolean>(false);
  
  // Create stable unique document key to prevent version conflicts  
  const uniqueDocumentKey = useRef(`${documentId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`);

  // Cleanup editor to prevent conflicts
  const cleanupEditor = useCallback(async () => {
    if (docEditor && !isDestroying) {
      console.log('🔧 Cleaning up existing editor...');
      setIsDestroying(true);
      try {
        docEditor.destroyEditor();
      } catch (error) {
        console.warn('Editor destruction:', error);
      }
      setDocEditor(null);
      docEditorRef.current = null; // Clear ref as well
      setIsDestroying(false);
    }
  }, [docEditor, isDestroying]);

  // Expose forceSave method to parent components 
  useImperativeHandle(ref, () => ({
    forceSave: async () => {
      console.log('🔧 Save requested for document:', documentId);
      
      if (!isDestroying && docEditor) {
        try {
          let saveAttempted = false;
          
          // Try documented save methods
          if (docEditor.requestSave) {
            docEditor.requestSave();
            console.log('🔧 Save via requestSave');
            saveAttempted = true;
          } else if (docEditor.forceSave) {
            docEditor.forceSave();
            console.log('🔧 Save via forceSave');
            saveAttempted = true;
          }

          if (!saveAttempted && onSave && docEditor.getSerialisedContent) {
            try {
              const content = docEditor.getSerialisedContent();
              onSave(content);
              console.log('🔧 Save via getSerialisedContent fallback');
            } catch (contentError) {
              console.warn('getSerialisedContent failed:', contentError);
            }
          }

          // Wait up to 2 seconds for save completion
          return new Promise(resolve => {
            const pollAttempts = 20;
            let attempts = 0;
            const checkSave = () => {
              attempts++;
              if (attempts >= pollAttempts || 
                  !docEditor || 
                  docEditor.getStatus && docEditor.getStatus() === 'ready') {
                resolve(void 0);
              } else {
                setTimeout(checkSave, 100);
              }
            };
            setTimeout(checkSave, 100);
          });

        } catch (saveError) {
          console.warn('Save attempt warning:', saveError);
          return Promise.resolve();
        }
      }
      return Promise.resolve();
    }
  }), [docEditor, documentId, onSave, isDestroying]);

  useEffect(() => {
    // Prevent duplicate initialization
    if (initializationAttempted.current) {
      console.log('🔧 Skipping duplicate initialization');
      return;
    }

    const initializeEditor = async () => {
      initializationAttempted.current = true;
      console.log('🔧 Starting OnlyOffice initialization for:', documentId);
      setIsLoading(true);
      setError(null);

      // Wait for DOM element
      const waitForElement = (attempts = 0) => {
        if (!editorRef.current) {
          if (attempts < 50) {
            console.log(`🔧 Waiting for editor ref... (${attempts + 1}/50)`);
            setTimeout(() => waitForElement(attempts + 1), 300);
            return;
          } else {
            setError('Editor ref not available');
            setIsLoading(false);
            onError?.('Editor element not ready');
            return;
          }
        }
        
        proceedWithInitialization();
      };

      const proceedWithInitialization = async () => {
        console.log('🔧 Editor ref ready, proceeding with initialization');
        
        try {
          // Build document URL for OnlyOffice accessibility
          const baseUrl = window.location.origin;
          const browserDocumentUrl = `${baseUrl}/api/documents/${documentId}/download`;
          
          // OnlyOffice Docker server callback & document resolution
          let onlyOfficeDocumentUrl = browserDocumentUrl;
          let onlyOfficeCallbackUrl = `${baseUrl}/api/onlyoffice/callback`; 
          // Check if we're running against a hosted OnlyOffice server
          const onlyofficeServerUrl = process.env.NEXT_PUBLIC_ONLYOFFICE_SERVER_URL || 'http://localhost:8080';
          
          if (onlyofficeServerUrl !== 'http://localhost:8080') {
            // Using hosted OnlyOffice server - no Docker networking needed!
            onlyOfficeDocumentUrl = browserDocumentUrl; // Use public URL straight  
            onlyOfficeCallbackUrl = `${baseUrl}/api/onlyoffice/callback`; // Use your published domain
            console.log('🔧 Using HOSTED OnlyOffice server - fixing networking!');
            console.log('🔧 OnlyOffice Server URL:', onlyofficeServerUrl);
          } else if (baseUrl.includes('localhost')) {
            // Fallback for localhost Docker development
            const dockerBase = baseUrl.replace(/localhost/, 'host.docker.internal');
            onlyOfficeDocumentUrl = `${dockerBase}/api/documents/${documentId}/download`;
            onlyOfficeCallbackUrl = `${dockerBase}/api/onlyoffice/callback`;
            console.log('🔧 Using Docker localhost development mode');
          }
          
          console.log(`🔧 Browser test URL: ${browserDocumentUrl}`);
          console.log(`🔧 OnlyOffice server URL: ${onlyOfficeDocumentUrl}`);
          console.log(`🔧 OnlyOffice callback URL: ${onlyOfficeCallbackUrl}`);
          console.log(`🔧 ------- {callbackUrl} Can reach Docker-host API: holding callbackUrl: ${onlyOfficeCallbackUrl} ----`);

          // Test document URL accessibility from browser first
          try {
            const testResponse = await fetch(browserDocumentUrl, {
              method: 'GET',
              headers: { 
                'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'User-Agent': 'OnlyOffice-DocumentServer',
                'Cache-Control': 'no-cache'
              }
            });
            console.log('🔧 Document URL test status:', testResponse.status, testResponse.statusText);
            if (!testResponse.ok) {
              console.warn('🔧 Document may fail to load - URL test failed with status:', testResponse.status);
              throw new Error(`Pre-test failed: ${testResponse.status} ${testResponse.statusText}`);
            }
              console.log('📄 Document URL verified as OnlyOffice-accessible');
          } catch (testError) {
            console.error('Host URL inaccessible - downgrading to localhost:', testError);
            onlyOfficeDocumentUrl = browserDocumentUrl;
            console.log('📄 Using localhost fallback for OnlyOffice');
          }

          // Only check email hosting for logs; don't actively prevent anything below
          // above component tries to load URL server/backend has available; we just run a quick 
          // dry run to tell user what happened.

          // Configure the OnlyOffice editor  
          const baseConfig = {
            document: {
              fileType: 'docx',
              key: uniqueDocumentKey.current,
              title: documentTitle,
              url: onlyOfficeDocumentUrl,  // Use the Docker-accessible URL for OnlyOffice
              callbackUrl: onlyOfficeCallbackUrl // Docker-accessible callback URL
            },
            documentType: 'word',
            editorConfig: {
              mode: 'edit',
              user: { id: 'user-1', name: 'Author' },
              customization: {
                autosave: true, // Re-enabled
                forcesave: true, // Enable forced save
                comments: true,
                help: false,
                hideRightMenu: false,
                leftMenu: true,
                rightMenu: true,
                statusBar: true,
                toolbar: true,
                header: true,
                footer: true
              },
              lang: 'en',
              region: 'en-US' // Use 'region' instead of deprecated 'location'
            },
            events: {
              onError: (event: any) => {
                console.warn('OnlyOffice error:', event?.data || 'Unknown');
                return false;
              },
              onWarning: (event: any) => {
                console.warn('OnlyOffice warning:', event?.data || 'Unknown');
                return false;
              },
              onInfo: (event: any) => {
                console.log('OnlyOffice info:', event?.data);
                if (event?.data?.status === 2 || event?.data?.status === 4) {
                  console.log('Save-type event received in onInfo');
                }
                return true;
              },
              onDocumentStateChange: (event: any) => {
                console.log('Document state changed trigger:', event?.data, event);
                
                // Document state change - only trigger if OnlyOffice callbacks failed
                // (Our backup: OnlyOffice Document Server callbacks not working due to Docker networking)
                if (event && typeof event.data === 'boolean' && !event.data) {
                  console.log('📝 Document editing ended - starting save process immediately');
                  
                  // CAPTURE DocEditor immediately using ref for reliable access
                  const currentEditor = docEditorRef.current;
                  console.log('📝 DocEditor captured', currentEditor ? 'Available' : 'Null');
                  
                  // If DocEditor exists, enable its save methods directly 
                  if (currentEditor) {
                    console.log('📝 DocEditor methods available:', Object.keys(currentEditor));
                    
                    // Try OnlyOffice save methods immediately
                    if (typeof currentEditor.requestSave === 'function') {
                      console.log('📝 ONLYOFFICE: requestSave() - asking OnlyOffice to save');
                      currentEditor.requestSave();
                    } else if (typeof currentEditor.downloadAs === 'function') {
                      console.log('📝 ONLYOFFICE: downloadAs() - downloading edited document');
                      currentEditor.downloadAs();
                    } else {
                      console.warn('📝 OnlyOffice methods not found - no requestSave/downloadAs available');
                    }
                  } else {
                    console.warn('📝 DocEditor already cleaned up - fallback to manual save');
                  }
                  
                  // ALWAYS provide backup callback (regardless of editor status)
                  console.log('📝 BACKUP: Manual save mechanism triggered');
                  fetch(`${window.location.origin}/api/onlyoffice/callback`, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      status: 4,
                      key: uniqueDocumentKey.current,
                      url: `${window.location.origin}/api/documents/${documentId}/download` // Same source as OnlyOffice downloaded
                    })
                  }).then(response => {
                    console.log('📝 Manual callback completed:', response.status);
                  }).catch(error => {
                    console.error('Manual callback failed:', error);
                  });
                  
                  // The save happens immediately now, no async promises in the document close flow.
                }
                return true;
              },
              onRequestSave: () => {
                console.log('🔧 onRequestSave triggered directly');
                return true;
              },
              onRequestEditRights: () => {
                console.log('Edit rights requested');
                return 1; // grant rights
              }
            },
            eventUrl: onlyOfficeCallbackUrl, // Top-level callback
            height: '100%',
            width: '100%'
          };

          // Set up JWT and use it for authorization in OnlyOffice if needed
          let config: any = { ...baseConfig };
          try {
            const tokenResponse = await fetch('/api/jwt/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ payload: baseConfig })
            });

            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              if (tokenData.token) {
                // OnlyOffice might still fail with Bearer auth due to CSRF-like issues.
                // Include token as separate field and append to document URL for reliability:
                config = { 
                  ...baseConfig, 
                  token: tokenData.token
                  // eventUrl already set in baseConfig
                };
                console.log('🔧 JWT token config for OnlyOffice complete');
              } else {
                console.log('🔧 No token available, continuing...');
              }
            } else {
              console.log('🔧 JWT fetch failed, continuing without headers...');
            }
          } catch (tokenError) {
            console.warn('JWT token non-critical / continuing:', tokenError);
          }

          // Load the OnlyOffice script if needed
          if (!scriptLoaded.current && !window.DocsAPI) {
            await loadOnlyOfficeScript();
          }

          // Clean up any prior instance to avoid "version has changed"
          await cleanupEditor();
          
          console.log('🔧 Callback URL being used:', onlyOfficeCallbackUrl);
          console.log('🔧 Document URL being used:', onlyOfficeDocumentUrl);
          console.log('🔧 Config being passed to OnlyOffice contains callbackUrl:', !!config.document.callbackUrl);
          
          // Create the editor
          if (editorRef.current && window.DocsAPI) {
            const newDocEditor = new window.DocsAPI.DocEditor(editorRef.current.id, config);
            setDocEditor(newDocEditor);
            docEditorRef.current = newDocEditor; // Store in ref for reliable access
            console.log('✅ OnlyOffice editor initialized - looking for save callback events');
            setIsLoading(false);
          } else {
            throw new Error('OnlyOffice API or DOM unavailable');
          }

        } catch (initError) {
          console.error('Editor init failed:', initError);
          setError(`Document editor failed to initialize: ${initError instanceof Error ? initError.message : 'Unknown'}`);
          setIsLoading(false);
          onError?.('Document editor failed');
        }
      };

      const loadOnlyOfficeScript = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.id = 'onlyoffice-api-script';
          
          const scriptUrl = `${process.env.NEXT_PUBLIC_ONLYOFFICE_SERVER_URL || 'http://localhost:8080'}/web-apps/apps/api/documents/api.js`;
          script.src = scriptUrl;
          
          script.onload = () => {
            console.log('OnlyOffice script loaded');
            scriptLoaded.current = true;
            
            // Poll window DocsAPI; it sometimes takes a cycle
            const waitForAPI = (attempts = 0) => {
              if (window.DocsAPI?.DocEditor) {
                console.log('OnlyOffice Docs API ready');
                resolve();
              } else if (attempts < 20) {
                setTimeout(() => waitForAPI(attempts + 1), 100);
              } else {
                reject(new Error('DocsAPI did not appear after 2 seconds'));
              }
            };
            waitForAPI();
          };
          
          script.onerror = e => reject(new Error(`Script failed to load: ${e || 'Unknown error'}`));
          
          const existing = document.getElementById('onlyoffice-api-script');
          if (existing) {
            console.log('Reusing existing script');
            resolve();
          } else {
            document.head.appendChild(script);
          }
        });
      };

      waitForElement();
    };

    initializeEditor();
  }, [documentId, documentTitle, onError]);

  // Cleanup when unmounting
  useEffect(() => {
    return () => {
      cleanupEditor();
    };
  }, [cleanupEditor]);

  // Handle errors
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-medium">Editor failed to load</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
          <p className="text-gray-500 text-xs mt-2">
            Ensure OnlyOffice server is running on localhost:8080
          </p>
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              initializationAttempted.current = false;
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height, width }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading editor...</p>
          </div>
        </div>
      )}
      <div 
        id={`onlyoffice-editor-${documentId}`}
        ref={editorRef}
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
});

// Extend Window interface for OnlyOffice
declare global {
  interface Window {
    DocsAPI: {
      DocEditor: new (id: string, config: any) => any;
    };
  }
}

export default OnlyOfficeEditor;